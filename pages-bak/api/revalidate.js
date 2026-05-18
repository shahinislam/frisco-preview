// pages/api/revalidate.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get token from header or query
  const token = req.headers['x-revalidate-secret'] || req.query.secret;
  
  // Verify token
  if (!token || token !== process.env.REVALIDATE_TOKEN) {
    console.error('❌ Invalid revalidation token');
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    // Get path to revalidate
    const { path = '/' } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    console.log(`🔄 Revalidating: ${path}`);
    
    // Revalidate the page
    await res.revalidate(path);
    
    console.log(`✅ Successfully revalidated: ${path}`);
    
    return res.json({ 
      success: true, 
      path,
      revalidatedAt: new Date().toISOString(),
      message: `Page ${path} revalidated successfully`
    });
    
  } catch (err) {
    console.error(`❌ Revalidation failed:`, err);
    
    // Check if page exists
    if (err.message.includes('Failed to revalidate')) {
      return res.status(404).json({ 
        success: false, 
        error: 'Page not found',
        path: req.body?.path 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      path: req.body?.path 
    });
  }
}