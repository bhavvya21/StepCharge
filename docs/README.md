# StepCharge documentation

Updated 16 November 2026 for the final export-only dashboard.

## Use the app

Start with [APP.md](APP.md). Download the repository, extract it and open `app/StepCharge.html`. The file is self-contained. **Export readings** saves the current capture; there are no visible connection or import controls.

The initial capture is generated data described in the app guide. Screenshots show the same capture. The dashboard is a presentation of those readings, not evidence of a physical energy-harvesting trial.

## Understand the readings

[TELEMETRY.md](TELEMETRY.md) defines firmware/export fields, units, sensor status values, and derived energy metrics. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) addresses startup and export problems.

## Build and measure hardware

1. Read [HARDWARE.md](HARDWARE.md) and inspect [circuit.svg](circuit.svg).
2. Configure and flash the firmware using the [repository README](../README.md).
3. Follow [TESTING.md](TESTING.md) for calibration, capture and experimental controls.
4. Compare claims against the evidence in [VALIDATION.md](VALIDATION.md).

The ESP32 measures the protected capacitor node and an independent mechanical switch. USB powers the ESP32; the tile does not power the board. The proposed circuit requires protection-component selection and bench validation.

## Maintain the repository

[GITHUB_UPLOAD.md](GITHUB_UPLOAD.md) covers source updates and upload. Rebuild `app/StepCharge.html` whenever app source or the circuit changes, then run the documented checks. Screenshots belong in `docs/screenshots/` and should be linked with relative paths.

[REFERENCES.md](REFERENCES.md) lists the technical sources used for the hardware reference. It records source provenance, not hardware test results.
