import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

export async function serveBuild() {
  const root = resolve('dist');
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.xml': 'application/xml',
  };
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      if (!path.startsWith('/Online-CV/')) {
        response.writeHead(404).end();
        return;
      }
      let file = resolve(root, path.slice('/Online-CV/'.length));
      if (file !== root && !file.startsWith(root + sep)) {
        response.writeHead(404).end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      const data = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
      });
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', ready);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () =>
      new Promise((ready, reject) =>
        server.close((error) => (error ? reject(error) : ready())),
      ),
  };
}
