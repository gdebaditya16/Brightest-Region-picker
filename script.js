let uploadedImage = null;

document.getElementById('imageInput').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    uploadedImage = new Image();
    uploadedImage.src = URL.createObjectURL(file);
  }
});

function processImage() {
  if (!uploadedImage) return;

  const windowSize = parseInt(document.getElementById("windowSize").value);
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const loadingBar = document.getElementById("loadingBar");
  const progress = document.getElementById("progress");
  loadingBar.style.display = "block";
  progress.style.width = "0%";
  progress.textContent = "0%";

  uploadedImage.onload = () => {
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;
    ctx.drawImage(uploadedImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, uploadedImage.width, uploadedImage.height);
    const { data, width, height } = imageData;

    const gray = [];
    for (let y = 0; y < height; y++) {
      gray[y] = [];
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        gray[y][x] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }

    let maxSum = -1;
    let bestTop = 0, bestLeft = 0;

    const totalSteps = (height - windowSize + 1) * (width - windowSize + 1);
    let step = 0;

    for (let y = 0; y <= height - windowSize; y++) {
      for (let x = 0; x <= width - windowSize; x++) {
        let sum = 0;
        for (let i = 0; i < windowSize; i++) {
          for (let j = 0; j < windowSize; j++) {
            sum += gray[y + i][x + j];
          }
        }
        if (sum > maxSum) {
          maxSum = sum;
          bestTop = y;
          bestLeft = x;
        }

        step++;
        if (step % 100 === 0) {
          let percent = Math.floor((step / totalSteps) * 100);
          progress.style.width = percent + "%";
          progress.textContent = percent + "%";
        }
      }
    }

    ctx.drawImage(uploadedImage, 0, 0);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.strokeRect(bestLeft, bestTop, windowSize, windowSize);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.fillRect(bestLeft, bestTop, windowSize, windowSize);

    progress.style.width = "100%";
    progress.textContent = "Done";
    setTimeout(() => loadingBar.style.display = "none", 1000);
  };

  if (uploadedImage.complete) {
    uploadedImage.onload();
  }
}
