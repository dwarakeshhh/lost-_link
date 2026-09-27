// ===== Post Found Item page logic =====

document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('categorySelect');
  const buildingSelect = document.getElementById('buildingSelect');
  const currentLocationSelect = document.getElementById('currentLocationSelect');

  fillSelect(categorySelect, CATEGORIES, false);
  fillSelect(buildingSelect, BUILDINGS, false);
  fillSelect(currentLocationSelect, CURRENT_LOCATIONS, false);

  const camera = initCamera({
    videoEl: document.getElementById('cameraVideo'),
    canvasEl: document.getElementById('cameraCanvas'),
    previewImgEl: document.getElementById('cameraPreview'),
    cameraBoxEl: document.getElementById('cameraBox'),
    captureBtn: document.getElementById('captureBtn'),
    retakeBtn: document.getElementById('retakeBtn'),
    fallbackLabel: document.getElementById('fallbackLabel'),
    fallbackInput: document.getElementById('fallbackInput'),
    statusEl: document.getElementById('cameraStatus'),
  });

  const form = document.getElementById('postForm');
  const errorEl = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.textContent = '';

    const imageFile = camera.getCapturedFile();
    const itemName = document.getElementById('itemNameInput').value.trim();
    const floor = document.getElementById('floorInput').value.trim();

    if (!imageFile) {
      errorEl.textContent = 'Please capture or choose a photo before posting.';
      return;
    }
    if (!itemName) {
      errorEl.textContent = 'Item name is required.';
      return;
    }
    if (!floor) {
      errorEl.textContent = 'Floor is required.';
      return;
    }

    const itemData = {
      itemName,
      category: categorySelect.value,
      description: document.getElementById('descriptionInput').value.trim(),
      building: buildingSelect.value,
      floor,
      area: document.getElementById('areaInput').value.trim(),
      currentLocation: currentLocationSelect.value,
    };

    const formData = new FormData();
    formData.append('item', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));
    formData.append('image', imageFile);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    try {
      const created = await apiPostForm('/items', formData);
      window.location.href = `item.html?id=${created.id}`;
    } catch (err) {
      errorEl.textContent = err.message || 'Could not post the item. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post Found Item';
    }
  });
});
