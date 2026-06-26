import next from 'next';
import { createServer } from 'node:http';
import { ensureDatabase } from './scripts/init-db.js';

const port = Number(process.env.PORT || 3001);
const hostname = '0.0.0.0';
const app = next({ dev: false, dir: process.cwd() });
const handle = app.getRequestHandler();

try {
  await ensureDatabase();
  await app.prepare();
} catch (error) {
  console.error('Startup failed');
  console.error(error);
  process.exit(1);
}

createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}).listen(port, hostname, () => {
  console.log(`Server ready on http://${hostname}:${port}`);
});
