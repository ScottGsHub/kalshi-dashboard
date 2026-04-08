#!/usr/bin/env node
/**
 * Kalshi Dashboard Server
 * 
 * - Serves the dashboard at http://localhost:3456
 * - Provides /api/refresh endpoint to update data
 * - Works from any directory
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3456;
const DASHBOARD_DIR = __dirname;
const EXPORT_SCRIPT = path.join(__dirname, 'export-data.js');

// MIME types for static file serving
const mimeTypes = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Run the export script to refresh data from Kalshi API
 */
function refreshData() {
  try {
    console.log('🔄 Refreshing data from Kalshi...');
    execSync(`node "${EXPORT_SCRIPT}"`, {
      cwd: DASHBOARD_DIR,
      stdio: 'inherit'
    });
    return true;
  } catch (e) {
    console.error('❌ Refresh failed:', e.message);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API: Refresh data
  if (req.url === '/api/refresh') {
    const success = refreshData();
    res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // API: Get status
  if (req.url === '/api/status') {
    const dataPath = path.join(DASHBOARD_DIR, 'data.json');
    const configPath = path.join(DASHBOARD_DIR, 'config.json');
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      dataExists: fs.existsSync(dataPath),
      configExists: fs.existsSync(configPath),
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Serve static files
  let filePath = req.url === '/' ? '/index.htm' : req.url;
  filePath = path.join(DASHBOARD_DIR, filePath.split('?')[0]); // strip query params
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(DASHBOARD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

// Check for config.json before starting
const configPath = path.join(DASHBOARD_DIR, 'config.json');
if (!fs.existsSync(configPath)) {
  console.log('⚠️  config.json not found.');
  console.log('   Copy config.example.json to config.json and add your Kalshi credentials.');
  console.log('   Starting server anyway - configure and use /api/refresh when ready.\n');
} else {
  // Initial data refresh on startup
  refreshData();
}

server.listen(PORT, () => {
  console.log(`
🚀 Kalshi Dashboard running at http://localhost:${PORT}

   Press Ctrl+C to stop
`);
});
