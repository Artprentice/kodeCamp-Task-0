//This is a tiny backend part that makes my plain HTML project able to talk to Clean URI on Vercel
//Like a middle man between website and cleanURL
//This is the Vercel serverless function. It works like a mini backend endpoint

//export default tells vercel this the main function in this file.
//async means the function will do something that will take time like waiting for a network request
//handler is the functions name. can be anything.
//req and res recieve request and sends response back
export default async function handler(req, res) {
  //checks if request is POST because were recieving data from url form
  //This means only POST requests are allowed. If someone tries GET, the function rejects it with status 405
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  //network requests can fail at any moment hence the try block. useful for risky code.
  //This gets the URL sent from the frontend
  try {
    // destructuring url value from req.body and stor in url variable
    const { url } = req.body;

    //If no URL came in, return an error and stop right here
    if (!url) {
      return res.status(400).json({ error: 'Missing URL' });//400 means bad request
    }

    //call Clean URI
    //Clean URI expects the data as form-encoded, not JSON. URLSearchParams creates the correct format
    
    //fetch is the browser/node way to request data from another server
    //await means wait till request is done
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      //method: 'POST' tells clearURL we are sending data not just asking for a page. cleanURL documentation says shortening endpoint uses POST
      method: 'POST',
      //tells cleanURL how body is formatted because cleanURL expects url-encoded data not json
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      //converts the url into the corect form-encoded fromat meaning url=https%3A%2F%2Fgoogle.com instead of { url: "https://google.com" }
      body: new URLSearchParams({ url }),
    });

    //read Clean URI response and turn the API response into a JavaScript object
    const data = await response.json();//

    //If all is good and API request succeeded
    if (!response.ok) {
      return res.status(response.status).json({
        //if not
        error: data.error || 'Error shortening URL',
      });
    }

    return res.status(200).json({ result_url: data.result_url });//if everything worked. send success 200(OK) code back to browser. result_url is the shortened link
    //if anything crashes in try block send code 500(internal server error) meaning something unexpected happened on server side
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
