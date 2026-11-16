# Validation record

Prepared: 14 November 2026.

Documentation reviewed: 16 November 2026. The documentation index, telemetry field reference, troubleshooting guide and circuit-label table describe the current export-only interface.

## Dashboard update — 16 November 2026

- JavaScript: all 10 telemetry and standalone runtime tests passed using Node.js 24.19.0. Standalone tests use a minimal DOM stub, not a browser engine.
- Standalone bundle rebuilt with embedded styles, logic and circuit diagram; no external resources required for the initial readings and export.
- Three user-supplied desktop screenshots added to `docs/screenshots/`. They document the interface with generated data, not physical performance.
- Final visible toolbar: Export readings only. No source badge, hardware-guide accordion, or circuit footnotes in the app.
- Automated browser preview was blocked by an unreachable local server. Mobile layout and real USB acquisition were not verified.
- Firmware and Python tooling were not changed by this update. Earlier results below are historical and were not rerun locally for this UI update.
- CI now includes Node.js tests and a reproducible standalone-bundle check. Check remote results in GitHub Actions after pushing.

## Original reference implementation — 14 November 2026

- Python analysis tests: all 5 test methods passed, including seven invalid-trial cases.
- Synthetic energy analysis: passed; 0.0015 J over 10 seconds and 10 steps, as expected.
- ESP32 firmware compilation: passed with Arduino CLI, board `esp32:esp32:esp32`, Espressif Arduino core 3.3.11. Program: 280,968 bytes (21%); globals: 22,252 bytes (6%). No device was flashed.
- Documentation: all relative Markdown links checked successfully.
- Local PlatformIO compilation: not run; the alternative pinned build is provided for CI and developer use.
- PlatformIO CI: workflow supplied; no GitHub execution yet.
- Hardware wiring, calibration, step counting, energy generation, and mechanical tests: not performed.

The original piezoelectric project was not recovered. This repository is a new, documented reference implementation. Component specifications and experimental procedures are proposed until physically verified.
