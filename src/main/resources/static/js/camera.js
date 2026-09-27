// ===== Camera-first photo capture, used by post.html =====

let cameraStream = null;
let capturedFile = null;

function initCamera({ videoEl, canvasEl, previewImgEl, cameraBoxEl, captureBtn, retakeBtn, fallbackLabel, fallbackInput, statusEl }) {

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showFallback('Camera API not supported on this browser. Choose a photo instead.');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      videoEl.srcObject = cameraStream;
      videoEl.style.display = 'block';
      previewImgEl.style.display = 'none';
      captureBtn.style.display = 'inline-flex';
      retakeBtn.style.display = 'none';
      fallbackLabel.style.display = 'none';
      statusEl.textContent = '';
    } catch (err) {
      showFallback('Camera access was denied or unavailable. Choose a photo instead.');
    }
  }

  function showFallback(message) {
    statusEl.textContent = message;
    videoEl.style.display = 'none';
    captureBtn.style.display = 'none';
    fallbackLabel.style.display = 'inline-flex';
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
  }

  function capturePhoto() {
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    canvasEl.toBlob(blob => {
      if (!blob) return;
      capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      previewImgEl.src = URL.createObjectURL(blob);
      previewImgEl.style.display = 'block';
      videoEl.style.display = 'none';
      captureBtn.style.display = 'none';
      retakeBtn.style.display = 'inline-flex';
      stopCamera();
    }, 'image/jpeg', 0.9);
  }

  function retake() {
    capturedFile = null;
    previewImgEl.style.display = 'none';
    retakeBtn.style.display = 'none';
    startCamera();
  }

  function handleFallbackFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    capturedFile = file;
    previewImgEl.src = URL.createObjectURL(file);
    previewImgEl.style.display = 'block';
    videoEl.style.display = 'none';
    fallbackLabel.style.display = 'none';
    retakeBtn.style.display = 'inline-flex';
  }

  captureBtn.addEventListener('click', capturePhoto);
  retakeBtn.addEventListener('click', retake);
  fallbackInput.addEventListener('change', handleFallbackFile);

  startCamera();

  window.addEventListener('beforeunload', stopCamera);

  return { getCapturedFile: () => capturedFile };
}
