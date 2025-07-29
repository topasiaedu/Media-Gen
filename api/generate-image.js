// Vercel Serverless Function for ModelArk Image Generation
// This runs on the server, avoiding CORS issues

export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-domain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, size, guidance_scale, watermark } = req.body;

    // Validate required fields
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get API key from environment
    const apiKey = process.env.ARK_API_KEY; // Note: No REACT_APP_ prefix for backend
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Call ModelArk API
    const modelarkResponse = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'seedream-3-0-t2i-250415',
        prompt,
        response_format: 'url',
        size: size || '1024x1024',
        guidance_scale: guidance_scale || 3,
        watermark: watermark !== undefined ? watermark : true
      })
    });

    if (!modelarkResponse.ok) {
      const errorText = await modelarkResponse.text();
      console.error('ModelArk API Error:', errorText);
      return res.status(modelarkResponse.status).json({ 
        error: `API Error: ${modelarkResponse.status} - ${errorText}` 
      });
    }

    const data = await modelarkResponse.json();
    
    // Return the response to frontend
    res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + (error.message || 'Unknown error')
    });
  }
} 