// main.js
window.IMGRATE_MAX_SIZE_KB = 50;

let originalFileSize = 0;
let originalFileName = '';
let isProcessing = false; // Prevent double processing

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('imgInput');

  if (!uploadArea || !fileInput) {
    console.error('Required elements not found');
    return;
  }

  // Drag and drop functionality
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && !isProcessing) {
      handleFileSelection(files[0]);
    }
  });

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    // Don't trigger if clicking on the file input itself
    if (e.target !== fileInput) {
      fileInput.click();
    }
  });

  // Prevent event bubbling on file input
  fileInput.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // File input change handler
  fileInput.addEventListener('change', function(e) {
    e.stopPropagation();
    const file = this.files[0];
    if (file && !isProcessing) {
      handleFileSelection(file);
    }
  });
});

// Main file handling function
async function handleFileSelection(file) {
  if (isProcessing) {
    console.log('Already processing a file');
    return;
  }

  isProcessing = true;
  originalFileSize = file.size;
  originalFileName = file.name;
  const maxSizeKB = window.IMGRATE_MAX_SIZE_KB || 50;

  const statusEl = document.getElementById('statusMsg');
  statusEl.innerHTML = "<span class='loading'>⏳ Uploading & optimizing...</span>";

  // Show original image preview
  const originalImg = document.getElementById('originalImg');
  const reader = new FileReader();
  reader.onload = (e) => {
    originalImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Update original size display
  const originalSizeKB = (originalFileSize / 1024).toFixed(2);
  document.getElementById('originalSizeDisplay').textContent = `${originalSizeKB} KB`;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`/optimize?max_size_kb=${maxSizeKB}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    let blob, url, sizeKB;

    if (contentType.includes('application/json')) {
      // Node.js server response
      const data = await res.json();
      url = data.url;
      sizeKB = data.sizeKB || data.size;

      // Fetch the image to display
      if (url) {
        try {
          const r2 = await fetch(url);
          if (!r2.ok) throw new Error('Failed to fetch optimized image');
          blob = await r2.blob();
          sizeKB = (blob.size / 1024).toFixed(2);
          url = URL.createObjectURL(blob);
        } catch (err) {
          console.warn('Could not fetch optimized image:', err);
        }
      }
    } else if (contentType.startsWith('image/')) {
      // FastAPI server response (direct image)
      blob = await res.blob();
      sizeKB = (blob.size / 1024).toFixed(2);
      url = URL.createObjectURL(blob);
    } else {
      throw new Error('Unexpected response type: ' + contentType);
    }

    // Display optimized image
    const optimizedImg = document.getElementById('optimizedImg');
    optimizedImg.src = url;

    // Update size displays
    document.getElementById('optimizedSizeDisplay').textContent = `${sizeKB} KB`;
    document.getElementById('origSizeText').textContent = `${originalSizeKB} KB`;
    document.getElementById('optSizeText').textContent = `${sizeKB} KB`;

    // Calculate savings
    const savingsKB = (originalSizeKB - sizeKB).toFixed(2);
    const savingsPercent = ((savingsKB / originalSizeKB) * 100).toFixed(0);
    
    document.getElementById('savingsText').textContent = `${savingsKB} KB`;
    document.getElementById('savingsPercent').textContent = `(${savingsPercent}% savings)`;

    // Detect format
    const format = file.type.split('/')[1].toUpperCase();
    document.getElementById('formatText').textContent = format;

    // Show comparison section
    document.getElementById('comparisonWrapper').style.display = 'block';
    
    // Scroll to comparison
    setTimeout(() => {
      document.getElementById('comparisonWrapper').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);

    statusEl.innerHTML = `<span style="color: #4CAF50; font-weight: bold;">✅ Optimization complete!</span>`;

  } catch (err) {
    console.error('Optimization error:', err);
    statusEl.innerHTML = `<span style="color: #f44336; font-weight: bold;">❌ ${err.message}</span>`;
  } finally {
    isProcessing = false;
    // Clear file input
    document.getElementById('imgInput').value = '';
  }
}

// Reset function
function resetOptimizer() {
  if (isProcessing) {
    return; // Don't reset while processing
  }

  document.getElementById('comparisonWrapper').style.display = 'none';
  document.getElementById('imgInput').value = '';
  document.getElementById('statusMsg').innerHTML = '';
  document.getElementById('originalImg').src = '';
  document.getElementById('optimizedImg').src = '';
  
  // Reset file size variables
  originalFileSize = 0;
  originalFileName = '';
  
  // Scroll back to upload area
  document.getElementById('optimizer').scrollIntoView({ behavior: 'smooth' });
}
