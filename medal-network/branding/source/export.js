// Render every SVG in ../<brand>/svg to PNG in ../<brand>/png (logos at 1x and 2x).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || '..');
(async () => {
  const b = await chromium.launch();
  for (const brand of fs.readdirSync(ROOT)) {
    const svgDir = path.join(ROOT, brand, 'svg');
    if (!fs.existsSync(svgDir)) continue;
    const pngDir = path.join(ROOT, brand, 'png'); fs.mkdirSync(pngDir, { recursive: true });
    for (const f of fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'))) {
      const svg = fs.readFileSync(path.join(svgDir, f), 'utf8');
      const [, w, h] = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/);
      const scales = f.includes('-logo') ? [1, 2] : [1];
      for (const sc of scales) {
        const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: sc });
        await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
        const name = f.replace('.svg', '').replace('-icon', f.includes('server') ? '-icon' : '-icon-512') + (sc === 2 ? '@2x' : '') + '.png';
        await p.screenshot({ path: path.join(pngDir, name), omitBackground: true, clip: { x: 0, y: 0, width: +w, height: +h } });
        await p.close();
        console.log(brand, name, w * sc + 'x' + h * sc);
      }
    }
  }
  await b.close();
})();
