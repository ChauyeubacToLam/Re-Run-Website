import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public');
const config = JSON.parse(fs.readFileSync(path.resolve(root, '../vercel.json'), 'utf8'));
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.wasm':'application/wasm'};
const port = Number(process.env.PORT || process.argv[2] || 3000);
http.createServer((req,res) => {
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad URL'); return; }
  let file=path.resolve(root,'.'+pathname);
  if (file!==root && !file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end('Not found'); return; }
  const headers={'content-type':types[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-cache'};
  for (const rule of config.headers) if (rule.source===pathname) for (const item of rule.headers) headers[item.key.toLowerCase()]=item.value;
  const size=fs.statSync(file).size;
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):size-1,size-1);
    if(start>end||start>=size){res.writeHead(416,{'content-range':`bytes */${size}`}).end();return;}
    res.writeHead(206,{...headers,'accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${size}`,'content-length':end-start+1});
    fs.createReadStream(file,{start,end}).pipe(res);
  } else {
    res.writeHead(200,{...headers,'content-length':size});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  }
}).listen(port,'127.0.0.1',()=>console.log(`RE:RUN preview: http://127.0.0.1:${port}`));
