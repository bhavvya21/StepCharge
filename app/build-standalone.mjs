import {readFile, writeFile} from 'node:fs/promises';
const read = async file => (await readFile(new URL(file,import.meta.url),'utf8')).replace(/\r\n/g,'\n');
let html = await read('index.html');
const css = (await read('style.css')).replace("@import url('data:text/css,');",'');
const logic = (await read('telemetry.mjs')).replaceAll('export function','function');
const app = (await read('app.mjs')).replace(/^import .*?;\r?\n/,'');
const circuit = 'data:image/svg+xml;base64,' + Buffer.from(await read('../docs/circuit.svg')).toString('base64');
html = html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`)
  .replace('<script type="module" src="app.mjs"></script>',()=>`<script>${logic}\n${app}</script>`)
  .replaceAll('../docs/circuit.svg',circuit)
  .replace('href="./"','href="#"')
  .replace('<a href="../docs/HARDWARE.md">Read the hardware guide →</a>','')
  .replace('Connect via USB using desktop Chrome or Edge, or import a saved capture on any device.','Ready to use — select Try demo or Import JSONL. Live USB requires a browser with Web Serial support.');
await writeFile(new URL('StepCharge.html',import.meta.url),html);
console.log('Built app/StepCharge.html — open directly in your browser. No server needed.');
