import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../public');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.includes('RE:RUN'), 'Missing RE:RUN entry page');
const content = JSON.parse(fs.readFileSync(path.join(root, 'assets/rerun/content.json'), 'utf8'));
assert.equal(Object.keys(content.variants).length, 12);
for (const variant of Object.values(content.variants)) {
  assert.equal(variant.gallery.length, 4);
  for (const image of variant.gallery) {
    const pathname = new URL(image.src, 'https://rerun.invalid').pathname;
    assert.ok(fs.existsSync(path.join(root, pathname)), `Missing ${pathname}`);
  }
}
for (const name of ['content.js', 'artwork-v2.css', 'passport-view.html', 'concept-reel.mp4']) {
  assert.ok(fs.statSync(path.join(root, 'assets/rerun', name)).size > 0, `Missing ${name}`);
}
new vm.Script(fs.readFileSync(path.join(root, 'assets/rerun/content.js'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.resolve(root, '../vercel.json'), 'utf8'));
assert.equal(config.outputDirectory, 'public');
const productPath = '/products/selkirk-omni-pickleball-paddle';
assert.ok(config.headers.some(h => h.source === productPath && h.headers.some(v => v.value.startsWith('application/json'))));
console.log('PASS: static Vercel output, 12 variants, 48 gallery references, runtime assets and MIME configuration.');
