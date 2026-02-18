#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3100;

const MIME_TYPES = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Maxi Dashboard running at http://0.0.0.0:${PORT}`);
  console.log(`🔒 Default password: "123" (hash in index.html)`);
  console.log(`📡 Access from network: http://YOUR_IP:${PORT}`);
});
