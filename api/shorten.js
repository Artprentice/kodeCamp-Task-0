export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: 'Missing URL' });
    return;
  }

  try {
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ result_url: data.result_url });
    } else {
      res.status(response.status).json({ error: data.error || 'Error shortening URL' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}