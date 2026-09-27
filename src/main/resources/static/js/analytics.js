// ===== Analytics dashboard logic (plain JS/CSS bar charts, no external libraries) =====

document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('statsGrid');
  const categoryChartEl = document.getElementById('categoryChart');
  const locationChartEl = document.getElementById('locationChart');
  const recentClaimedEl = document.getElementById('recentClaimed');

  try {
    const data = await apiGet('/analytics');

    statsEl.innerHTML = `
      ${statCard('Total Items', data.totalItems)}
      ${statCard('Available', data.availableItems)}
      ${statCard('Claimed', data.claimedItems)}
      ${statCard('Found Today', data.itemsFoundToday)}
      ${statCard('Claimed Today', data.itemsClaimedToday)}
    `;

    renderBarChart(categoryChartEl, data.itemsByCategory);
    renderBarChart(locationChartEl, data.itemsByLocation);

    if (data.recentlyClaimed && data.recentlyClaimed.length > 0) {
      recentClaimedEl.innerHTML = data.recentlyClaimed.map(item => `
        <div class="detail-row">
          <span>${escapeHtml(item.itemName)} (${label(item.category)})</span>
          <span>${item.claimedAt ? item.claimedAt.replace('T', ' ').slice(0, 16) : ''}</span>
        </div>
      `).join('');
    } else {
      recentClaimedEl.innerHTML = `<p style="color:#64748b;">No items claimed yet.</p>`;
    }

  } catch (err) {
    statsEl.innerHTML = `<p style="color:#dc2626;">Could not load analytics.</p>`;
  }
});

function statCard(label, value) {
  return `
    <div class="stat-card">
      <div class="value">${value ?? 0}</div>
      <div class="label">${label}</div>
    </div>
  `;
}

function renderBarChart(containerEl, dataObj) {
  const entries = Object.entries(dataObj || {});
  if (entries.length === 0) {
    containerEl.innerHTML = `<p style="color:#64748b;">No data yet.</p>`;
    return;
  }
  const max = Math.max(...entries.map(([, v]) => v), 1);

  containerEl.innerHTML = entries.map(([name, count]) => `
    <div class="bar-row">
      <div class="bar-label">${label(name)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(count / max) * 100}%"></div>
      </div>
      <div class="bar-value">${count}</div>
    </div>
  `).join('');
}
