export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    if (req.method === 'POST') {
      const response = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        throw new Error(`Failed to create blob: ${response.statusText}`);
      }

      // Read Location header or x-jsonblob-id
      const location = response.headers.get('Location') || response.headers.get('location');
      const blobId = location ? location.split('/').pop() : response.headers.get('x-jsonblob-id');

      if (!blobId) {
        throw new Error('No blob ID returned from jsonblob');
      }

      return res.status(200).json({ id: blobId });
    }

    if (req.method === 'GET') {
      if (!id) {
        return res.status(400).json({ error: 'Missing ID parameter' });
      }

      const response = await fetch(`https://jsonblob.com/api/jsonBlob/${id}`, {
        headers: {
          'User-Agent': userAgent
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Blob not found' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'Missing ID parameter' });
      }

      const response = await fetch(`https://jsonblob.com/api/jsonBlob/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        throw new Error(`Failed to update blob: ${response.statusText}`);
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
