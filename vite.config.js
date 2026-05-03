import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { spawn } from 'child_process'

function mealMateApiPlugin() {
  return {
    name: 'mealmate-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/prices', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { items } = JSON.parse(body || '{}');
            const scriptPath = path.resolve(__dirname, 'scripts/fetch-real-prices.mjs');
            const child = spawn(process.execPath, [scriptPath, '--json'], {
              stdio: ['pipe', 'pipe', 'pipe'],
              env: process.env,
            });

            let output = '';
            let errorOutput = '';
            child.stdout.on('data', chunk => { output += chunk; });
            child.stderr.on('data', chunk => { errorOutput += chunk; });
            child.stdin.end(JSON.stringify({ items }));

            child.on('close', code => {
              if (code !== 0) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: errorOutput || `Price script exited with ${code}` }));
                return;
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(output);
            });
          } catch (err) {
            console.error('[/api/prices]', err.message);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mealMateApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@base44/sdk': path.resolve(__dirname, './src/lib/base44-sdk-shim.js'),
    },
  },
})
