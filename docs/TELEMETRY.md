# Telemetry and exported readings

StepCharge firmware writes one JSON object per line at **115200 baud**. The dashboard exports the same JSON Lines structure. File extension: `.jsonl`; numeric values use the units below regardless of display formatting.

## Schema 1

| Field | Type / unit | Meaning |
|---|---|---|
| `schema` | Integer | Format version; currently `1` |
| `session` | Nonnegative integer | Counter incremented when firmware resets the measurement session |
| `uptime_ms` | Nonnegative integer, ms | Device uptime, not a calendar timestamp |
| `steps` | Nonnegative integer | Debounced mechanical tile activations in this session |
| `adc_raw` | Number, ADC counts | Averaged raw ADC reading; firmware uses 12-bit resolution |
| `adc_mv` | Number, mV | Averaged ADC input voltage |
| `storage_v` | Number, V | Storage-node voltage after divider and calibration correction |
| `capacitance_f` | Number, F | Configured storage capacitance; `0` means unconfigured |
| `status` | String | Measurement validity status listed below |
| `stored_energy_j` | Number, J, or `null` | Capacitor energy when status is `ok`; otherwise `null` |

The firmware reports every field. Older fixtures may omit ADC fields; the app displays them as unavailable. `session` alone does not identify a device or a globally unique trial: rebooting resets firmware state. Use one valid session and a strictly increasing device clock per analysis window.

Example generated record:

```json
{"schema":1,"session":1,"uptime_ms":61000,"steps":30,"adc_raw":1489,"adc_mv":1200,"storage_v":2.4,"capacitance_f":0.001,"status":"ok","stored_energy_j":0.00288}
```

## Sensor status

| Status | Meaning |
|---|---|
| `starting` | Initial firmware state before the first voltage sample |
| `overrange` | ADC raw count ≥ 4000, ADC voltage > 2800 mV, or storage voltage above the configured maximum |
| `below_range` | ADC voltage < 150 mV or calculated storage voltage < 0 V |
| `configure_capacitance` | Voltage is in range, but configured capacitance is ≤ 0 F |
| `ok` | Voltage is in range and capacitance is configured |

Range conditions take precedence over the capacitance warning. `ok` describes firmware range/configuration checks; it does not prove calibration, circuit protection, or physical performance.

## Display and calculations

| Dashboard value | Source / calculation |
|---|---|
| Storage voltage | Latest `storage_v`, V |
| Tile activations | Latest `steps` |
| Stored energy | Latest valid `stored_energy_j` × 1000, mJ |
| Net storage change | ½C(Vfinal² − Vinitial²) × 1000, mJ |
| Mean net storage power | Net energy in J / elapsed seconds × 1,000,000, µW |
| Net energy / step | Net energy in J / step-count difference × 1,000,000, µJ/step |
| Window duration | (`uptime_ms` final − initial) / 1000, s |

Per-step energy is unavailable when the step-count difference is zero. Negative net energy and power are preserved. Invalid status, changed capacitance, resets or discontinuous time invalidate window calculations. The analyzer does not add back leakage, load consumption or rectifier loss to estimate gross generation.

The initial dashboard capture runs from 1 to 61 seconds of uptime, a **60-second window**, and contains 61 samples. Its 30-step increase is the difference between the final and initial counters.

## Export and provenance

The final app exports its displayed capture; it does not acquire new physical readings. Initial exports use `stepcharge-synthetic-<timestamp>.jsonl`. That timestamp records download naming time, not a device measurement time. Values inside the file retain their original units and device timestamps.

The files [synthetic_trial.jsonl](../examples/synthetic_trial.jsonl) and [demo_readings.jsonl](../examples/demo_readings.jsonl) are separate generated fixtures. Neither contains measured tile-performance data. For physical captures, use the Python serial tool documented in the [repository README](../README.md).
