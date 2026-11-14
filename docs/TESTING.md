# Calibration and experimental method

## Software checks

```sh
python -m unittest discover -s tests -v
python tools/analyze.py examples/synthetic_trial.jsonl
```

The synthetic example deliberately represents a 1 mF capacitor increasing from 1 V to 2 V over 10 seconds and ten steps. It demonstrates the calculation only.

## Voltage calibration

1. Disconnect the piezo source. Apply known low-voltage DC to the protected storage input with a current-limited bench supply.
2. Compare multimeter VCAP against telemetry at multiple points, for example 0.5, 1, 2, 3, 4, and 5 V. Confirm the ADC pin stays within its allowed range.
3. Set TOP_OHMS and BOTTOM_OHMS to measured divider values.
4. Adjust VOLTAGE_GAIN and VOLTAGE_OFFSET_V using a fitted linear correction; check residuals at points not used in the fit. If residuals are unacceptable, use a better ADC/front end rather than claiming accuracy.
5. Record meter model, range, component values, temperature, error, and calibration date. Do not calibrate against an assumed 3.3 V ADC reference.

The firmware uses Espressif's analogReadMilliVolts API. For classic ESP32 at 11 dB attenuation, its documented useful range is approximately 150–3100 mV at the ADC. StepCharge uses a more conservative high threshold of 2800 mV and flags below 150 mV. It cannot accurately quantify near-zero capacitor energy with this front end.

## Capacitance and counting

Measure actual storage capacitance and enter CAPACITANCE_F in farads. Supercapacitor leakage, ESR, and voltage dependence require additional characterization; the constant-C model is only an approximation.

Manually operate the switch twenty times and compare counts. Hold it down for five seconds: this must count once. Release and press again: it must count once more. Very short pulses under the 25 ms debounce period may be missed. The 250 ms minimum interval limits accepted activation rate to about four per second. The polling design is for a single tile, not high-speed multi-lane counting. Repeat with actual tile mechanics to assess double triggers and missed activations.

## Controlled energy trials

1. Keep the ESP32 on USB. Disconnect all optional loads and define a starting VCAP above the valid measurement floor.
2. Begin capture before stepping. Ensure every recorded sample has status `ok` and the first sample precedes the trial.
3. Apply a fixed number of repeatable loads at a documented cadence. Record force/displacement if efficiency will be estimated, plus mounting, transducer count, starting voltage, and ambient conditions.
4. Allow the final storage reading to settle, stop capture, and analyze. Counts and elapsed time are differences between first and last samples; any events outside that window are excluded.
5. Run at least five repeats plus a no-step control of the same duration and comparable initial voltage.
6. Report all trial values, their spread, and the control. The control characterizes leakage/loading but does not exactly correct losses during a rising-voltage trial.

Do not reset the session or unplug the board inside a trial. Opening a serial port may reset the board; check the stream. The analyzer rejects session changes and decreasing/non-increasing timestamps.

## Interpreting energy and power

- Stored energy: E = C V^2 / 2.
- Signed change: delta E = C (Vfinal^2 - Vinitial^2) / 2.
- Mean net storage power: delta E / elapsed seconds.
- Net energy per activation: delta E / counted activations, undefined when count is zero.
- If measuring a resistive load separately: Eload = integral(Vload^2 / R) dt, using a sampling rate that resolves its waveform.
- Mechanical work: W = integral(F dx), not simply body mass times gravitational acceleration. Efficiency requires matched electrical and mechanical measurement windows and a stated system boundary.

Approximate independent uncertainty for stored energy is u(E)/E = sqrt((u(C)/C)^2 + (2u(V)/V)^2). A small difference between two large energy readings can have high relative uncertainty. Near-zero increases should not be presented as meaningful generation without an uncertainty analysis.

## Planned acceptance checks

| Check | Required evidence |
|---|---|
| Wiring and input limits | Scope/meter traces showing protection works under worst-case pulses |
| Calibration | Measured voltage error across the chosen range; target established before testing |
| Step counting | Manual ground-truth count versus firmware across repeated load cycles |
| Energy repeatability | Raw captures, test conditions, mean/spread, and no-step controls |
| Mechanical durability | Documented load/travel and inspection after repeated cycles |
| Self-powered feasibility | Separate harvester and full-system power budgets; not implemented here |

No numerical hardware acceptance result has been filled in without a physical test.
