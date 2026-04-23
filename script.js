document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shorten-form');
  const urlInput = document.getElementById('original-url');
  const resultsContainer = document.getElementById('results-container');
  const errorMessage = document.getElementById('error-message');
  const submitButton = form.querySelector('button[type="submit"]');

  const STORAGE_KEY = 'shortenedLinks';
  let links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  function saveLinks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  function renderLinks() {
    resultsContainer.innerHTML = '';

    links.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';

      card.innerHTML = `
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2">
          <a href="${item.original}" target="_blank" class="text-decoration-none result-original">${item.original}</a>
          <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
            <a href="${item.short}" target="_blank" class="text-decoration-none result-short">${item.short}</a>
            <button class="btn btn-info text-white px-4 copy-btn" data-index="${index}">Copy</button>
          </div>
        </div>
      `;

      resultsContainer.appendChild(card);
    });

    document.querySelectorAll('.copy-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const index = Number(button.dataset.index);
        const text = links[index].short;

        try {
          await navigator.clipboard.writeText(text);

          document.querySelectorAll('.copy-btn').forEach((btn) => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          });

          button.textContent = 'Copied!';
          button.classList.add('copied');
        } catch (err) {
          alert('Copy failed');
        }
      });
    });
  }

  async function shortenUrl(url) {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }

    return data.result_url;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const longUrl = urlInput.value.trim();

    if (!longUrl) {
      urlInput.classList.add('error-input');
      errorMessage.textContent = 'Please add a link';
      errorMessage.classList.remove('d-none');
      return;
    }

    urlInput.classList.remove('error-input');
    errorMessage.classList.add('d-none');

    const validUrl = /^https?:\/\//i.test(longUrl) ? longUrl : `https://${longUrl}`;

    try {
      submitButton.textContent = 'Shortening...';
      const shortUrl = await shortenUrl(validUrl);

      links.unshift({
        original: validUrl,
        short: shortUrl
      });

      saveLinks();
      renderLinks();
      urlInput.value = '';
    } catch (err) {
      errorMessage.textContent = err.message;
      errorMessage.classList.remove('d-none');
      urlInput.classList.add('error-input');
    } finally {
      submitButton.textContent = 'Shorten It!';
    }
  });

  renderLinks();
});
