// ===== Shared constants and helpers used across all pages =====

const API_BASE = '/api';

const CATEGORIES = [
  'ELECTRONICS', 'MOBILE_PHONE', 'LAPTOP', 'EARPHONES', 'BAGS', 'WALLET',
  'KEYS', 'ID_CARD', 'BOOKS', 'DOCUMENTS', 'ACCESSORIES', 'CLOTHING',
  'STATIONERY', 'OTHER',
];

const BUILDINGS = [
  'MAIN_BLOCK', 'CSE_BLOCK', 'IT_BLOCK', 'LIBRARY', 'CANTEEN',
  'LABORATORY', 'HOSTEL', 'AUDITORIUM', 'PARKING', 'OTHER',
];

const CURRENT_LOCATIONS = [
  'STILL_AT_FOUND_LOCATION', 'WITH_ME', 'SUBMITTED_TO_OFFICE', 'OTHER',
];

const REPORT_REASONS = [
  'WRONG_INFORMATION', 'DUPLICATE', 'FAKE_POST',
  'INAPPROPRIATE_IMAGE', 'SENSITIVE_INFORMATION', 'OTHER',
];

// "MAIN_BLOCK" -> "Main Block"
function label(value) {
  if (!value) return '';
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function fillSelect(selectEl, values, includeAllOption, allLabel) {
  selectEl.innerHTML = '';
  if (includeAllOption) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = allLabel || 'All';
    selectEl.appendChild(opt);
  }
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = label(v);
    selectEl.appendChild(opt);
  });
}

async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

async function apiPostJson(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    const error = new Error(err?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.body = err;
    throw error;
  }
  return res.json();
}

async function apiPostForm(path, formData) {
  const res = await fetch(API_BASE + path, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await safeJson(res);
    const error = new Error(err?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.body = err;
    throw error;
  }
  return res.json();
}

async function apiPut(path) {
  const res = await fetch(API_BASE + path, { method: 'PUT' });
  if (!res.ok) {
    const err = await safeJson(res);
    const error = new Error(err?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.body = err;
    throw error;
  }
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
