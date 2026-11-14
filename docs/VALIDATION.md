# Validation record

Prepared: 14 November 2026.

- Python analysis tests: all 5 test methods passed, including seven invalid-trial cases.
- Synthetic energy analysis: passed; 0.0015 J over 10 seconds and 10 steps, as expected.
- ESP32 firmware compilation: passed with Arduino CLI, board `esp32:esp32:esp32`, Espressif Arduino core 3.3.11. Program: 280,968 bytes (21%); globals: 22,252 bytes (6%). No device was flashed.
- Documentation: all relative Markdown links checked successfully.
- Local PlatformIO compilation: not run; the alternative pinned build is provided for CI and developer use.
- PlatformIO CI: workflow supplied; no GitHub execution yet.
- Hardware wiring, calibration, step counting, energy generation, and mechanical tests: not performed.

The original piezoelectric project was not recovered. This repository is a new, documented reference implementation. Component specifications and experimental procedures are proposed until physically verified.
