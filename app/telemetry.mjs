// UI demonstration only; these are not measurements or predicted performance.
export function demoReadings() {
  return Array.from({length:61}, (_,i) => {
    const steps = Math.floor(i/2);
    const voltage = Number((1.2 + steps*0.041 - i*0.0005).toFixed(5));
    return {schema:1,session:1,uptime_ms:(i+1)*1000,steps,
      adc_raw:Math.round(voltage/2/3.3*4095),adc_mv:voltage*500,
      storage_v:voltage,capacitance_f:0.001,status:'ok',stored_energy_j:0.0005*voltage*voltage};
  });
}

export function validate(r) {
  if (!r || r.schema !== 1) throw new Error('Expected StepCharge schema 1');
  for (const k of ['session', 'uptime_ms', 'steps', 'capacitance_f', 'storage_v']) {
    if (typeof r[k] !== 'number' || !Number.isFinite(r[k])) throw new Error(`Invalid ${k}`);
  }
  for (const k of ['session', 'uptime_ms', 'steps']) {
    if (!Number.isSafeInteger(r[k]) || r[k] < 0) throw new Error(`Invalid ${k}`);
  }
  if (!['ok', 'below_range', 'overrange', 'configure_capacitance', 'starting'].includes(r.status)) throw new Error('Unknown sensor status');
  for (const k of ['adc_raw', 'adc_mv', 'stored_energy_j']) {
    if (r[k] != null && (typeof r[k] !== 'number' || !Number.isFinite(r[k]))) throw new Error(`Invalid ${k}`);
  }
  return r;
}

export function summarize(rows) {
  if (rows.length < 2) return {error: 'Waiting for two samples'};
  const first = rows[0], last = rows.at(-1);
  for (let i = 0; i < rows.length; i++) {
    const r = validate(rows[i]), p = rows[i - 1];
    if (r.status !== 'ok' || r.capacitance_f <= 0 || r.storage_v < 0) return {error: 'Window contains invalid or unconfigured readings. Start a new window after resolving them.'};
    if (r.capacitance_f !== first.capacitance_f) return {error: 'Capacitance changed. Start a new window.'};
    if (p && (r.session !== p.session || r.uptime_ms <= p.uptime_ms || r.steps < p.steps)) return {error: 'Session reset or clock discontinuity. Start a new window.'};
  }
  const duration = (last.uptime_ms - first.uptime_ms) / 1000;
  const energy = 0.5 * first.capacitance_f * (last.storage_v ** 2 - first.storage_v ** 2);
  const steps = last.steps - first.steps;
  return {duration, energy, power: energy / duration, perStep: steps ? energy / steps : null, steps};
}
