import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const docsDir = path.join(rootDir, 'docs');

async function buildStandalone() {
  console.log('📦 Generating 100% standalone offline HTML application (IIFE)...');

  // 1. Find compiled CSS from dist/assets
  let cssContent = '';
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
      console.log(`✓ Loaded compiled Tailwind CSS (${(cssContent.length / 1024).toFixed(1)} KB)`);
    }
  }

  // 2. Bundle everything with esbuild into a single self-executing IIFE
  // format: 'iife' means NO imports, NO exports, NO module syntax, 100% executable under file:// protocol
  const result = await esbuild.build({
    entryPoints: [path.join(rootDir, 'src', 'main.tsx')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
    minify: true,
    treeShaking: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.VITE_APP_TITLE': '"UCAM Murcia CB - Horarios y WhatsApp"',
    },
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.svg': 'dataurl',
      '.webp': 'dataurl',
      '.css': 'empty', // CSS is handled directly via Vite's compiled CSS
    },
    write: false,
  });

  let jsContent = result.outputFiles[0].text;
  // Escape closing script tags to avoid breaking HTML parser
  jsContent = jsContent.replace(/<\/script/gi, '<\\/script');
  console.log(`✓ Built single IIFE JavaScript bundle (${(jsContent.length / 1024).toFixed(1)} KB)`);

  // 3. Assemble the single-file HTML document
  const htmlContent = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UCAM Murcia CB - Delegado Hub</title>
    <meta name="description" content="Herramienta de gestión de horarios y envío automatizado de planificaciones por WhatsApp para UCAM Murcia CB." />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏀</text></svg>" />
    <style>
${cssContent}
    </style>
  </head>
  <body class="bg-stone-950 text-stone-100 min-h-screen">
    <div id="root"></div>
    <script>
${jsContent}
    </script>
  </body>
</html>`;

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write to dist, public, and docs (for GitHub Pages root/docs deployment)
  fs.writeFileSync(path.join(distDir, 'standalone-app.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'standalone-app.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.join(docsDir, 'index.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');
  // Also as a .txt file so dev servers never intercept it as an SPA route
  fs.writeFileSync(path.join(publicDir, 'standalone-app.txt'), htmlContent, 'utf8');

  console.log(`🚀 Standalone HTML generated successfully! Written to dist, public, and docs/index.html`);
}

buildStandalone().catch((err) => {
  console.error('Error generating standalone app:', err);
  process.exit(1);
});
