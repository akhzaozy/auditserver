const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

process.env.NEXT_TELEMETRY_DISABLED = '1';
const port = parseInt(process.env.PORT, 10) || 5543;
const hostname = process.env.HOSTNAME || '0.0.0.0';

const app = next({
  dev: false,
  hostname,
  port,
  dir: __dirname,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Sentinel Server Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
