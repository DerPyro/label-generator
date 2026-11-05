import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 3003);
const prefix = (process.env.BASE_PATH || '').replace(/\/$/, '');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json' };
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (prefix) {
      if (pathname === prefix) { res.writeHead(302, { Location: prefix + '/' }).end(); return; }
      if (!pathname.startsWith(prefix + '/')) { res.writeHead(404).end(); return; }
      pathname = pathname.slice(prefix.length);
    }
    const target = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!target.startsWith(root)) { res.writeHead(403).end(); return; }
    const bytes = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(bytes);
  } catch { res.writeHead(404).end('Datei nicht gefunden'); }
}).listen(port, '127.0.0.1', () => console.log(`v3: http://localhost:${port}`));
