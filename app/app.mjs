import {validate, summarize, demoReadings} from './telemetry.mjs';
const $ = id => document.getElementById(id);
let rows = [], port, reader, reading, timer, lastReceived = 0, mode = 'Not connected', skipped = 0, synthetic = false;
const fmt = (v, unit = '', digits = 3) => v == null ? '—' : `${v.toLocaleString(undefined, {maximumFractionDigits: digits})} ${unit}`;
const set = (id, value) => $(id).textContent = value;
const tell = text => set('notice', text);
function draw() {
  const data = rows.slice(-300), svg = $('chart');
  svg.replaceChildren();
  const add = (name, attrs, content) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    if (content != null) el.textContent = content;
    svg.append(el);
  };
  const max = Math.max(1, ...data.map(r => r.storage_v)), min = Math.min(0, ...data.map(r => r.storage_v));
  for (let i = 0; i < 5; i++) {
    const y = 20 + i * 45;
    add('line', {x1:48,y1:y,x2:780,y2:y,stroke:'#e0e7dc','stroke-dasharray':'4 5'});
    add('text', {x:0,y:y+4,fill:'#7b897b','font-size':11}, (max - i * (max-min)/4).toFixed(2));
  }
  if (!data.length) return;
  // Index spacing remains readable when a capture includes a reboot; analysis flags the discontinuity.
  const points = data.map((r,i) => `${48+i*732/Math.max(1,data.length-1)},${20+180*(max-r.storage_v)/(max-min)}`).join(' ');
  add('polyline', {points,fill:'none',stroke:'#5b853d','stroke-width':3,'stroke-linejoin':'round'});
  add('text',{x:48,y:230,fill:'#7b897b','font-size':11},fmt(data[0].uptime_ms/1000,'s uptime',1));
  add('text',{x:780,y:230,'text-anchor':'end',fill:'#7b897b','font-size':11},fmt(data.at(-1).uptime_ms/1000,'s uptime',1));
  set('chartCaption', `${data.length} latest samples · evenly spaced by sample · values in volts`);
}
function render() {
  const r = rows.at(-1);
  set('source',synthetic ? '' : mode); $('source').hidden = synthetic; set('count',`${rows.length.toLocaleString()} samples`);
  $('export').disabled = !rows.length;
  set('voltage',fmt(r?.storage_v,'V')); set('steps',fmt(r?.steps,'',0));
  set('energy',fmt(r?.status === 'ok' ? r.stored_energy_j * 1000 : null,'mJ'));
  // An absent energy field must remain unavailable, never become zero.
  if (r?.stored_energy_j == null) set('energy','—');
  set('status',r ? r.status.replaceAll('_',' ') : 'Waiting');
  set('statusHelp',({ok:'Within configured measurement range',configure_capacitance:'Set measured capacitance in config.h',overrange:'Input exceeds measurement range',below_range:'Below calibrated measurement range',starting:'Device initializing'})[r?.status] || 'No samples received');
  set('raw',fmt(r?.adc_raw,'counts',0)); set('adc',fmt(r?.adc_mv,'mV',2));
  set('cap',fmt(r ? r.capacitance_f*1e6 : null,'µF')); set('uptime',fmt(r ? r.uptime_ms/1000 : null,'s',1));
  set('session',fmt(r?.session)); set('schema',fmt(r?.schema));
  const s = summarize(rows);
  set('net',fmt(s.energy == null ? null : s.energy*1000,'mJ'));
  set('power',fmt(s.power == null ? null : s.power*1e6,'µW'));
  set('perStep',fmt(s.perStep == null ? null : s.perStep*1e6,'µJ/step'));
  set('duration',fmt(s.duration,'s',1)); set('windowNote',s.error || `${s.steps} counted steps in this window.`);
  draw();
}
function append(r) {
  validate(r);
  if (rows.length >= 20000) throw new Error('20,000-sample limit reached. Export readings and start a new window.');
  rows.push(r); lastReceived = Date.now(); render();
}
function controls(active) {
  for (const id of ['connect','demo','import']) $(id).disabled = active;
  $('disconnect').disabled = !active;
}
async function stop() {
  clearInterval(timer); timer = null;
  if (reader) await reader.cancel().catch(()=>{});
  if (reading) await reading;
  if (port) await port.close().catch(()=>{});
  port = null; mode = rows.length ? 'Disconnected · saved readings' : 'Not connected';
  controls(false); render();
}
$('disconnect').onclick = async () => {await stop(); tell('Disconnected. Readings remain available to export.');};
$('new').onclick = () => {rows = []; skipped = 0; render(); tell('New measurement window started. The device step counter is unchanged.');};
$('demo').onclick = () => {
  rows = []; synthetic = true; mode = 'DEMO · synthetic readings'; controls(true); let tick = 0;
  tell('');
  const sample = () => { const v = 1 + Math.min(tick,120)*0.025;
    append({schema:1,session:1,uptime_ms:(tick+1)*1000,steps:tick,adc_raw:Math.round(v/2/3.3*4095),adc_mv:v*500,storage_v:v,capacitance_f:0.001,status:'ok',stored_energy_j:0.0005*v*v}); tick++;
  };
  sample(); timer = setInterval(() => {try {sample();} catch(e) {clearInterval(timer);tell(e.message);}},1000);
};
$('connect').onclick = async () => {
  if (!navigator.serial) {tell('Live USB requires desktop Chrome or Edge on localhost or HTTPS. You can import a capture here instead.');return;}
  controls(true);
  try {
    port = await navigator.serial.requestPort(); await port.open({baudRate:115200});
    rows = []; synthetic = false; skipped = 0; mode = 'LIVE · USB serial'; lastReceived = Date.now(); render();
    tell('Connected at 115200 baud. Opening USB may reboot the ESP32.');
    reading = (async () => {
      reader = port.readable.getReader(); const decoder = new TextDecoder(); let buffer = '';
      try {
        while (true) {
          const {value,done} = await reader.read(); if (done) break;
          buffer += decoder.decode(value,{stream:true});
          const lines = buffer.split('\n'); buffer = lines.pop();
          if (buffer.length > 65536) {buffer = ''; skipped++; tell('Oversized serial line skipped.');}
          for (const line of lines) {
            if (!line.trim()) continue;
            let r;
            try {r = validate(JSON.parse(line));} catch {skipped++;tell(`${skipped} non-telemetry or malformed lines skipped.`);continue;}
            append(r);
          }
        }
      } catch(e) {tell(`Serial stopped: ${e.message}`);}
      finally {reader.releaseLock();reader = null;}
    })();
    await reading;
    if (port) await port.close().catch(()=>{});
    port = null; controls(false); mode = 'Disconnected · saved readings'; render();
  } catch(e) {await stop();tell(`Connection unavailable: ${e.message}`);}
};
$('import').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 12*1024*1024) throw new Error('Choose a capture under 12 MB.');
    const incoming = (await file.text()).split(/\r?\n/).filter(l=>l.trim()).map((line,i)=>{
      try {return validate(JSON.parse(line));} catch(e) {throw new Error(`Line ${i+1}: ${e.message}`);}
    });
    if (!incoming.length || incoming.length > 20000) throw new Error('Capture must contain 1–20,000 samples.');
    rows = incoming; synthetic = false; mode = 'IMPORTED · saved capture'; render(); tell(`Loaded ${file.name}. These are saved readings, not a live connection.`);
  } catch(e) {tell(`Import failed: ${e.message}`);} finally {event.target.value = '';}
};
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([rows.map(r=>JSON.stringify(r)).join('\n')+'\n'],{type:'application/x-ndjson'}));
  const a = document.createElement('a'); a.href=url; a.download=`stepcharge-${synthetic?'synthetic':'capture'}-${Date.now()}.jsonl`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
setInterval(()=>{if(mode.startsWith('LIVE')) set('source',Date.now()-lastReceived>4000?'LIVE · waiting for data (stale)':mode);},1000);
rows = demoReadings();
synthetic = true;
mode = 'DEMO · synthetic sample capture';
tell('');
render();

