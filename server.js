const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const contentTypes = { '.css': 'text/css', '.html': 'text/html', '.jpg': 'image/jpeg', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, 'index.html')) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}).listen(4174, () => console.log('Thrivepix Global concept: http://localhost:4174/'));
