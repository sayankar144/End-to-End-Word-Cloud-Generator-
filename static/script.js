let wordLimit = 100;
let removeStopwords = true;

// Elements
const pasteTab = document.getElementById('pasteTab');
const uploadTab = document.getElementById('uploadTab');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadBox = document.getElementById('uploadBox');
const fileInfo = document.getElementById('fileInfo');
const fileNameDisplay = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');

const minusBtn = document.getElementById('minusBtn');
const plusBtn = document.getElementById('plusBtn');
const wordCount = document.getElementById('wordCount');

const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const img = document.getElementById('wordcloudImage');

const placeholder = document.querySelector('.placeholder');

// Initial UI state
uploadArea.classList.add('hidden');
fileInput.value = '';

// Tab toggles
uploadTab.addEventListener('click', () => {
  pasteTab.classList.remove('active');
  uploadTab.classList.add('active');
  textInput.style.display = 'none';
  uploadArea.classList.remove('hidden');
});

pasteTab.addEventListener('click', () => {
  uploadTab.classList.remove('active');
  pasteTab.classList.add('active');
  uploadArea.classList.add('hidden');
  textInput.style.display = 'block';
});

// Number buttons
minusBtn.addEventListener('click', () => {
  if (wordLimit > 10) {
    wordLimit -= 5;
    wordCount.textContent = wordLimit;
  }
});

plusBtn.addEventListener('click', () => {
  if (wordLimit < 200) {
    wordLimit += 5;
    wordCount.textContent = wordLimit;
  }
});

document.getElementById('stopwordToggle').addEventListener('change', (e) => {
  removeStopwords = e.target.checked;
});

// Drag & drop + click behavior for upload box
uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', (e) => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', async (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelected();
  }
});

fileInput.addEventListener('change', handleFileSelected);

removeFileBtn.addEventListener('click', () => {
  fileInput.value = '';
  fileInfo.style.display = 'none';
  fileNameDisplay.textContent = '';
});

// Show file info when a file is chosen
function handleFileSelected() {
  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileInfo.style.display = 'flex';
    fileNameDisplay.textContent = file.name;
  } else {
    fileInfo.style.display = 'none';
  }
}

// Generate
generateBtn.addEventListener('click', async () => {
  let textData = '';

  if (!uploadArea.classList.contains('hidden') && fileInput.files.length > 0) {
    try {
      const file = fileInput.files[0];
      const content = await file.text();
      textData = content;
    } catch (err) {
      alert('Failed to read the uploaded file. Make sure it is a plain .txt file.');
      return;
    }
  } else {
    textData = textInput.value.trim();
  }

  if (!textData) return alert('Please enter or upload some text!');

  // UX: disable button while generating
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textData,
        theme: 'light',
        max_words: wordLimit,
        remove_stopwords: removeStopwords
      })
    });

    const data = await response.json();
    if (response.ok && data.image_url) {
      // Add timestamp parameter to bust browser cache
      img.src = data.image_url + '?t=' + Date.now();
      img.style.display = 'block';
      placeholder.style.display = 'none';
      downloadBtn.style.display = 'inline-block';
    } else {
      const msg = data && data.error ? data.error : 'Failed to generate word cloud!';
      alert(msg);
    }
  } catch (err) {
    alert('Request failed. Check your server is running and try again.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
  }
});

// Start over
clearBtn.addEventListener('click', () => {
  textInput.value = '';
  fileInput.value = '';
  fileInfo.style.display = 'none';
  img.src = '';
  img.style.display = 'none';
  placeholder.style.display = 'block';
  downloadBtn.style.display = 'none';
});

// Download
downloadBtn.addEventListener('click', () => {
  if (!img.src) return;
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'wordcloud.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
});
