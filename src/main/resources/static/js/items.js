// ===== Shared feed rendering, used by index.html and search.html =====

function renderItemCard(item) {
  const statusClass = item.status === 'AVAILABLE' ? 'status-available' : 'status-claimed';
  const desc = item.description ? `<div class="item-card-desc">${escapeHtml(item.description)}</div>` : '';

  return `
    <div class="item-card">
      <img src="${item.imageUrl || ''}" alt="${escapeHtml(item.itemName)}" onerror="this.style.opacity=0.3" />
      <div class="item-card-body">
        <span class="status-badge ${statusClass}">${item.status}</span>
        <div class="item-card-title">${escapeHtml(item.itemName)}</div>
        <div class="item-card-meta">${label(item.category)} · ${label(item.building)}${item.floor ? `, ${item.floor}` : ''}</div>
        ${item.area ? `<div class="item-card-meta">📌 ${escapeHtml(item.area)}</div>` : ''}
        <div class="item-card-meta">Found ${item.foundDate} ${item.foundTime ? item.foundTime.slice(0, 5) : ''}</div>
        ${desc}
        <div class="item-card-actions">
          <a class="btn btn-outline" href="item.html?id=${item.id}">View Details</a>
        </div>
      </div>
    </div>
  `;
}

function renderFeed(containerEl, items) {
  if (!items || items.length === 0) {
    containerEl.innerHTML = `
      <div class="empty-state">
        <div style="font-size:2rem;">🔎</div>
        <p>No items found</p>
        <p>Try changing your search or filters.</p>
      </div>
    `;
    return;
  }
  containerEl.innerHTML = items.map(renderItemCard).join('');
}

async function loadFeedInto(containerEl) {
  containerEl.innerHTML = `<p style="text-align:center;color:#64748b;grid-column:1/-1;">Loading items...</p>`;
  try {
    const items = await apiGet('/items');
    renderFeed(containerEl, items);
  } catch (err) {
    containerEl.innerHTML = `<p style="text-align:center;color:#dc2626;grid-column:1/-1;">Could not load items. Is the backend running?</p>`;
  }
}
