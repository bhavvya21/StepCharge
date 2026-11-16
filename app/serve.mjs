import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../',import.meta.url));
const types = {'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.md':'text/plain','.jsonl':'text/plain'};
http.createServer(async(req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
    if (!target.startsWith(root) || !/^\/(app|docs|examples)\//.test(pathname)) {res.writeHead(404);res.end('Not found');return;}
    const data = await readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(8080,'127.0.0.1',()=>console.log('StepCharge: http://localhost:8080/app/'));


