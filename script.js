// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('shorten-form');
  const urlInput = document.getElementById('original-url');
  const resultContainer = document.createElement('div');
  resultContainer.id = 'shortened-links';
  resultContainer.className = 'mt-4';

  form.appendChild(resultContainer);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const longUrl = urlInput.value.trim();

    if (!longUrl) {
      alert('Please enter a URL.');
      return;
    }

    // Show a loading message
    resultContainer.innerHTML = '<p>Shortening...</p>';

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      });
      const data = await response.json();

      if (response.ok) {
        // Create a new link element
        const linkDiv = document.createElement('div');
        linkDiv.className = 'd-flex align-items-center mb-2';

        const shortLink = document.createElement('a');
        shortLink.href = data.result_url;
        shortLink.target = '_blank';
        shortLink.textContent = data.result_url;
        shortLink.className = 'me-3';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'btn btn-sm btn-primary';

        // Copy to clipboard on click
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(data.result_url).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          });
        });

        linkDiv.appendChild(shortLink);
        linkDiv.appendChild(copyButton);
        resultContainer.innerHTML = '';
        resultContainer.appendChild(linkDiv);
      } else {
        resultContainer.innerHTML = `<p class="text-danger">Error: ${data.error || 'Failed to shorten URL'}</p>`;
      }
    } catch (err) {
      resultContainer.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
    }
  });
});