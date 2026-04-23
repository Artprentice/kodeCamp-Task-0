//This is the Vercel serverless function. It works like a mini backend endpoint
export default async function handler(req, res) {
  //This means only POST requests are allowed. If someone tries GET, the function rejects it
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  //This gets the URL sent from the frontend
  try {
    const { url } = req.body;

    //If no URL came in, return an error
    if (!url) {
      return res.status(400).json({ error: 'Missing URL' });
    }

    //call Clean URI
    //Clean URI expects the data as form-encoded, not JSON. URLSearchParams creates the correct format
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }),
    });

    //read Clean URI response and turn the API response into a JavaScript object
    const data = await response.json();

    //If all is good
    if (!response.ok) {
      return res.status(response.status).json({
        //if not
        error: data.error || 'Error shortening URL',
      });
    }

    return res.status(200).json({ result_url: data.result_url });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
