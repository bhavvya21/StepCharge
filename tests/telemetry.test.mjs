import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate,summarize} from '../app/telemetry.mjs';
const rows = readFileSync(new URL('../examples/synthetic_trial.jsonl',import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
test('matches reference synthetic energy and power',()=>{
  const s = summarize(rows); assert.equal(s.energy,0.0015);assert.equal(s.duration,10);assert.equal(s.steps,10);assert.ok(Math.abs(s.power-0.00015)<1e-12);
});
test('preserves negative net energy',()=>{assert.ok(summarize([rows[1],{...rows[0],uptime_ms:21000,steps:20}]).energy<0);});
test('rejects reset, time reversal, invalid status and changed capacitance',()=>{
  for(const change of [{session:2},{uptime_ms:1},{status:'overrange'},{capacitance_f:0.002}]) assert.ok(summarize([rows[0],{...rows[1],...change}]).error);
  assert.throws(()=>summarize([rows[0],{...rows[1],steps:-1}]));
});
test('zero steps has no per-step result',()=>{assert.equal(summarize([rows[0],{...rows[1],steps:0}]).perStep,null);});
test('rejects malformed or nonfinite telemetry',()=>{
  for(const r of [null,{}, {...rows[0],storage_v:NaN},{...rows[0],steps:true},{...rows[0],adc_mv:'oops'}]) assert.throws(()=>validate(r));
});
test('unconfigured capacitance suppresses analysis',()=>{assert.ok(summarize(rows.map(r=>({...r,capacitance_f:0,status:'configure_capacitance'}))).error);});
