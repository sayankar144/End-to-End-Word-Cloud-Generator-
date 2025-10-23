let wordLimit = 100;
let removeStopwords = true;

// Tabs
const pasteTab = document.getElementById('pasteTab');
const uploadTab = document.getElementById('uploadTab');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('fileInput');

uploadTab.addEventListener('click', () => {
  pasteTab.classList.remove('active');
  uploadTab.classList.add('active');
  textInput.style.display = 'none';
  fileInput.style.display = 'block';
});

pasteTab.addEventListener('click', () => {
  uploadTab.classList.remove('active');
  pasteTab.classList.add('active');
  fileInput.style.display = 'none';
  textInput.style.display = 'block';
});

// Number buttons
const minusBtn = document.getElementById('minusBtn');
const plusBtn = document.getElementById('plusBtn');
const wordCount = document.getElementById('wordCount');

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

// Generate
document.getElementById('generateBtn').addEventListener('click', async () => {
  let textData = '';

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const content = await file.text();
    textData = content;
  } else {
    textData = textInput.value.trim();
  }

  if (!textData) return alert('Please enter or upload some text!');

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
  if (data.image_url) {
    const img = document.getElementById('wordcloudImage');
    img.src = data.image_url + '?t=' + Date.now();
    img.style.display = 'block';
    document.querySelector('.placeholder').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'inline-block';
  } else alert('Failed to generate word cloud!');
});

// Start over
document.getElementById('clearBtn').addEventListener('click', () => {
  textInput.value = '';
  fileInput.value = '';
  document.getElementById('wordcloudImage').src = '';
  document.querySelector('.placeholder').style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'none';
});

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
  const img = document.getElementById('wordcloudImage');
  if (!img.src) return;
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'wordcloud.png';
  link.click();
});
