const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, server) => {
  return (req, res, next) => {
    // Forward /api and /health requests to Express Backend on internal port 8000
    if (req.url && (req.url.startsWith('/api/') || req.url === '/api' || req.url.startsWith('/health'))) {
      const backendPort = process.env.BACKEND_PORT || 8000;

      const headers = { ...req.headers };
      headers.host = `127.0.0.1:${backendPort}`;

      const options = {
        hostname: '127.0.0.1',
        port: backendPort,
        path: req.url,
        method: req.method,
        headers,
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on('error', (err) => {
        console.error('[Metro API Proxy Error]:', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Unable to connect to attendance server. Please ensure backend is running.'
          }));
        }
      });

      req.pipe(proxyReq, { end: true });
      return;
    }

    if (originalEnhanceMiddleware) {
      return originalEnhanceMiddleware(metroMiddleware, server)(req, res, next);
    }
    return metroMiddleware(req, res, next);
  };
};

module.exports = config;
