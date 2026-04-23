//Waiting for the page to load
document.addEventListener('DOMContentLoaded', () => {
  //Getting page elements
  const form = document.getElementById('shorten-form');
  const urlInput = document.getElementById('original-url');
  const resultsContainer = document.getElementById('results-container');
  const errorMessage = document.getElementById('error-message');
  const submitButton = form.querySelector('button[type="submit"]');

  //tries to load saved links from the browser, converts the saved JSON text back into a real array, and if nothing is saved yet, uses an empty array.
  const STORAGE_KEY = 'shortenedLinks';
  let links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  //This saves the links array into localStorage. JSON stringify to convert array/object to json text
  function saveLinks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  //Rendering links, this clears the results area before re-adding everything. loop makes the page show every saved result instead of only the latest one
  function renderLinks() {
    resultsContainer.innerHTML = '';

    links.forEach((item, index) => {
      //This creates a brand-new div in JavaScript.
      const card = document.createElement('div');
      card.className = 'result-card';

      //puts HTML inside it
      //Each result card gets a button the button has a data-index value so JavaScript knows which link it belongs to. when clicked, the code uses navigator.clipboard.writeText(text)
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

  //This function sends the long URL to custom Vercel API route
  //Because my own endpoint is cleaner and makes it easier to manage the request before it reaches Clean URI
  async function shortenUrl(url) {
    const response = await fetch('/api/shorten', {
      method: 'POST',//because we are sending data
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });//to send the URL as JSON

    const data = await response.json();

    //if the API returns an error, stop and shows a useful message instead of silently failing
    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }

    return data.result_url;
  }

  //This listens for the form being submitted. preventDefault() stops the browser from refreshing the page, because we want JavaScript to handle the action instead
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    //Then it reads the input value:
    //trim() removes spaces from the beginning and end. This matters because Clean URI says spaces are not allowed in the URL input
    const longUrl = urlInput.value.trim();

    //This is the custom validation. If the input is empty: add a red border, show the error message, stop the function.
    if (!longUrl) {
      urlInput.classList.add('error-input');
      errorMessage.textContent = 'Please add a link';
      errorMessage.classList.remove('d-none');
      return;
    }

    urlInput.classList.remove('error-input');
    errorMessage.classList.add('d-none');

    //Adding http if needed
    //This checks whether the user already typed http:// or https://. If they did, keep it. If they didn’t, add https:// automatically. This makes the app friendlier because many people type google.com instead of https://google.com.
    const validUrl = /^https?:\/\//i.test(longUrl) ? longUrl : `https://${longUrl}`;

    //Calling the API and storing the result
    try {
      submitButton.textContent = 'Shortening...';
      const shortUrl = await shortenUrl(validUrl);//This waits for the short link to come back

      links.unshift({
        original: validUrl,
        short: shortUrl
      });//This adds the new item to the beginning of the array, so the newest link appears first

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
