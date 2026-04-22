// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shorten-form');
  const input = document.getElementById('original-url');
  const linksContainer = document.createElement('div');
  linksContainer.id = 'links-container';
  document.querySelector('.shorten-wrap').appendChild(linksContainer);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const originalUrl = input.value.trim();
    if (originalUrl) {
      shortenLink(originalUrl);
      input.value = '';
    }
  });

  function shortenLink(url) {
    fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.result_url) {
        displayLink(url, data.result_url);
      } else {
        alert('Error shortening URL. Please try again.');
      }
    })
    .catch(() => {
      alert('Network error. Please try again.');
    });
  }

  function displayLink(original, short) {
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-3';

    const linkInfo = document.createElement('div');
    linkInfo.className = 'flex-fill bg-light p-3 rounded d-flex justify-content-between align-items-center';

    const textsDiv = document.createElement('div');

    const originalPara = document.createElement('p');
    originalPara.className = 'mb-0';
    originalPara.innerText = original;

    const shortSmall = document.createElement('small');
    shortSmall.className = 'text-muted';
    shortSmall.innerText = short;

    textsDiv.appendChild(originalPara);
    textsDiv.appendChild(shortSmall);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-primary';
    copyBtn.innerText = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(short).then(() => {
        copyBtn.innerText = 'Copied!';
        setTimeout(() => (copyBtn.innerText = 'Copy'), 2000);
      });
    };

    linkInfo.appendChild(textsDiv);
    div.appendChild(linkInfo);
    div.appendChild(copyBtn);

    // Append the new link display
    document.getElementById('links-container').appendChild(div);
  }
});