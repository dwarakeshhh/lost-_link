// ===== Search & filter page logic =====

document.addEventListener('DOMContentLoaded', () => {
  const feedEl = document.getElementById('feed');
  const keywordInput = document.getElementById('keywordInput');
  const categorySelect = document.getElementById('categorySelect');
  const buildingSelect = document.getElementById('buildingSelect');
  const floorInput = document.getElementById('floorInput');
  const dateInput = document.getElementById('dateInput');
  const applyBtn = document.getElementById('applyBtn');
  const clearBtn = document.getElementById('clearBtn');

  fillSelect(categorySelect, CATEGORIES, true, 'All Categories');
  fillSelect(buildingSelect, BUILDINGS, true, 'All Buildings');

  // Pre-fill keyword from ?keyword= if navigated from the home page search bar
  const params = new URLSearchParams(window.location.search);
  const initialKeyword = params.get('keyword');
  if (initialKeyword) {
    keywordInput.value = initialKeyword;
    runSearch();
  } else {
    loadFeedInto(feedEl);
  }

  applyBtn.addEventListener('click', runSearch);
  keywordInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

  clearBtn.addEventListener('click', () => {
    keywordInput.value = '';
    categorySelect.value = '';
    buildingSelect.value = '';
    floorInput.value = '';
    dateInput.value = '';
    loadFeedInto(feedEl);
  });

  async function runSearch() {
    const keyword = keywordInput.value.trim();
    const category = categorySelect.value;
    const building = buildingSelect.value;
    const floor = floorInput.value.trim();
    const date = dateInput.value;

    const hasFilters = category || building || floor || date;

    feedEl.innerHTML = `<p style="text-align:center;color:#64748b;grid-column:1/-1;">Searching...</p>`;

    try {
      let items;
      if (hasFilters) {
        const qs = new URLSearchParams();
        if (category) qs.set('category', category);
        if (building) qs.set('building', building);
        if (floor) qs.set('floor', floor);
        if (date) qs.set('date', date);
        items = await apiGet('/items/filter?' + qs.toString());
      } else if (keyword) {
        items = await apiGet('/items/search?keyword=' + encodeURIComponent(keyword));
      } else {
        items = await apiGet('/items');
      }
      renderFeed(feedEl, items);
    } catch (err) {
      feedEl.innerHTML = `<p style="text-align:center;color:#dc2626;grid-column:1/-1;">Search failed. Please try again.</p>`;
    }
  }
});
