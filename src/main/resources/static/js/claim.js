// ===== Item details page logic: view, claim, report =====

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const detailEl = document.getElementById('itemDetail');

  if (!itemId) {
    detailEl.innerHTML = `<div class="empty-state">No item specified. <a href="index.html">Back to feed</a></div>`;
    return;
  }

  let currentItem = null;

  try {
    currentItem = await apiGet(`/items/${itemId}`);
    render();
  } catch (err) {
    detailEl.innerHTML = `<div class="empty-state">Item not found. <a href="index.html">Back to feed</a></div>`;
    return;
  }

  function render() {
    const item = currentItem;
    const statusClass = item.status === 'AVAILABLE' ? 'status-available' : 'status-claimed';

    detailEl.innerHTML = `
      <div class="detail-grid">
        <img src="${item.imageUrl || ''}" alt="${escapeHtml(item.itemName)}" />
        <div class="detail-info">
          <span class="status-badge ${statusClass}">${item.status}</span>
          <h2>${escapeHtml(item.itemName)}</h2>
          ${item.description ? `<p style="color:#64748b;">${escapeHtml(item.description)}</p>` : ''}

          <div class="detail-row"><span>Category</span><span>${label(item.category)}</span></div>
          <div class="detail-row"><span>Building</span><span>${label(item.building)}</span></div>
          <div class="detail-row"><span>Floor</span><span>${escapeHtml(item.floor || '')}</span></div>
          ${item.area ? `<div class="detail-row"><span>Area</span><span>${escapeHtml(item.area)}</span></div>` : ''}
          <div class="detail-row"><span>Currently</span><span>${label(item.currentLocation)}</span></div>
          <div class="detail-row"><span>Found Date</span><span>${item.foundDate}</span></div>
          <div class="detail-row"><span>Found Time</span><span>${item.foundTime ? item.foundTime.slice(0, 5) : ''}</span></div>

          <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
            ${item.status === 'AVAILABLE'
              ? `<button class="btn btn-primary btn-lg" id="claimBtn">✅ I Found My Item</button>`
              : `<span style="color:#64748b;">This item has already been claimed.</span>`}
            <button class="btn btn-danger" id="reportBtn">🚩 Report Post</button>
          </div>
        </div>
      </div>
    `;

    const claimBtn = document.getElementById('claimBtn');
    if (claimBtn) claimBtn.addEventListener('click', showClaimConfirm);
    document.getElementById('reportBtn').addEventListener('click', showReportModal);
  }

  function showClaimConfirm() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>Did you collect this item?</h3>
        <p>By continuing, this item will be marked as claimed and removed from the public feed.</p>
        <div class="modal-actions">
          <button class="btn btn-outline" id="cancelClaim">Cancel</button>
          <button class="btn btn-primary" id="confirmClaim">Confirm Claim</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#cancelClaim').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#confirmClaim').addEventListener('click', async () => {
      const btn = overlay.querySelector('#confirmClaim');
      btn.disabled = true;
      btn.textContent = 'Confirming...';
      try {
        currentItem = await apiPut(`/items/${itemId}/claim`);
        overlay.remove();
        render();
      } catch (err) {
        alert(err.message || 'Could not claim this item.');
        overlay.remove();
        currentItem = await apiGet(`/items/${itemId}`);
        render();
      }
    });
  }

  function showReportModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>Report this post</h3>
        <div class="form-group">
          <label>Reason</label>
          <select id="reportReason"></select>
        </div>
        <div class="form-group">
          <label>Additional details (optional)</label>
          <textarea id="reportDesc" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="cancelReport">Cancel</button>
          <button class="btn btn-primary" id="submitReport">Submit Report</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    fillSelect(overlay.querySelector('#reportReason'), REPORT_REASONS, false);

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#cancelReport').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#submitReport').addEventListener('click', async () => {
      const btn = overlay.querySelector('#submitReport');
      const reason = overlay.querySelector('#reportReason').value;
      const description = overlay.querySelector('#reportDesc').value;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      try {
        await apiPostJson('/reports', { itemId: Number(itemId), reason, description });
        overlay.querySelector('.modal').innerHTML = `
          <h3>Thanks for the report</h3>
          <p>Our team will take a look at this post.</p>
          <div class="modal-actions"><button class="btn btn-primary" id="closeReport">Close</button></div>
        `;
        overlay.querySelector('#closeReport').addEventListener('click', () => overlay.remove());
      } catch (err) {
        alert('Could not submit report. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Submit Report';
      }
    });
  }
});
