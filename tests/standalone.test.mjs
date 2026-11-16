import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html = readFileSync(new URL('../app/StepCharge.html',import.meta.url),'utf8');
function load() {
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],{textContent:'',disabled:false,replaceChildren(){},append(){}}]));
  const context = vm.createContext({document:{getElementById:id=>{
    assert.ok(elements.has(id),`Missing element ${id}`);return elements.get(id);
  },createElementNS:()=>({setAttribute(){}})},navigator:{},setInterval:()=>1,clearInterval(){},Date,TextDecoder,Blob,URL});
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  return elements;
}
test('standalone has no external script or stylesheet dependency',()=>{
  assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+rel="stylesheet"|type="module"/);
  assert.match(html,/data:image\/svg\+xml;base64,/);
});
test('initializes and demo updates readings without a server',()=>{
  const els = load();
  assert.equal(els.get('source').textContent,''); assert.equal(els.get('source').hidden,true);
  assert.equal(els.get('voltage').textContent,'2.4 V');
  assert.equal(els.get('energy').textContent,'2.88 mJ');
  assert.equal(els.get('net').textContent,'2.16 mJ');
  assert.equal(els.get('power').textContent,'36 µW');
  els.get('demo').onclick();
  assert.equal(els.get('source').textContent,''); assert.equal(els.get('source').hidden,true);
  assert.equal(els.get('voltage').textContent,'1 V');
  assert.equal(els.get('energy').textContent,'0.5 mJ');
  assert.equal(els.get('export').disabled,false);
});
test('imports fixture and calculates expected net energy',async()=>{
  const els = load();
  const data = readFileSync(new URL('../examples/synthetic_trial.jsonl',import.meta.url),'utf8');
  await els.get('import').onchange({target:{files:[{name:'trial.jsonl',size:data.length,text:async()=>data}],value:'trial.jsonl'}});
  assert.equal(els.get('net').textContent,'1.5 mJ');
  assert.equal(els.get('power').textContent,'150 µW');
  assert.match(els.get('source').textContent,/IMPORTED/);
});
test('unsupported USB reports actionable message',async()=>{
  const els = load();await els.get('connect').onclick();assert.match(els.get('notice').textContent,/Live USB requires/);
});

