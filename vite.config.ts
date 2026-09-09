import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'serve-standalone-download',
        configureServer(server) {
          server.middlewares.use('/api/roster', (req, res) => {
            const filePath = path.resolve(__dirname, 'src/data/savedRoster.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (Array.isArray(data) && data.length > 0) {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, count: data.length }));
                    return;
                  }
                } catch (e) {
                  console.error('Error saving roster:', e);
                }
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid roster data' }));
              });
              return;
            }

            if (req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              if (fs.existsSync(filePath)) {
                try {
                  const content = fs.readFileSync(filePath, 'utf8');
                  res.end(content || '[]');
                  return;
                } catch (e) {
                  console.error('Error reading savedRoster:', e);
                }
              }
              res.end('[]');
              return;
            }

            res.statusCode = 405;
            res.end();
          });

          server.middlewares.use('/api/group-links', (req, res) => {
            const filePath = path.resolve(__dirname, 'src/data/groupLinks.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (data && typeof data === 'object') {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                } catch (e) {
                  console.error('Error saving groupLinks:', e);
                }
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid group links data' }));
              });
              return;
            }

            if (req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              if (fs.existsSync(filePath)) {
                try {
                  const content = fs.readFileSync(filePath, 'utf8');
                  res.end(content || '{}');
                  return;
                } catch (e) {
                  console.error('Error reading groupLinks:', e);
                }
              }
              res.end(JSON.stringify({ staffGroupUrl: '', allTeamGroupUrl: '' }));
              return;
            }

            res.statusCode = 405;
            res.end();
          });

          server.middlewares.use('/download-standalone-html', (req, res) => {
            const filePath = path.resolve(__dirname, 'dist/standalone-app.html');
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Content-Disposition', 'attachment; filename="UCAM_Murcia_Delegado_Hub_Offline.html"');
              res.setHeader('Content-Length', content.length);
              res.end(content);
            } else {
              res.statusCode = 404;
              res.end('File not generated yet');
            }
          });

          server.middlewares.use('/standalone-app.txt', (req, res) => {
            const filePath = path.resolve(__dirname, 'dist/standalone-app.html');
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Content-Length', content.length);
              res.end(content);
            } else {
              res.statusCode = 404;
              res.end('Not found');
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
