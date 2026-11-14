#pragma once

// Target: classic ESP32-WROOM-32 development board (not C3/S3).
namespace Config {
constexpr int VOLTAGE_PIN = 34;      // ADC1, input only
constexpr int STEP_PIN = 27;         // normally-open switch to GND
constexpr float TOP_OHMS = 100000.0f;
constexpr float BOTTOM_OHMS = 100000.0f;
constexpr float VOLTAGE_GAIN = 1.0f; // calibrate against a multimeter
constexpr float VOLTAGE_OFFSET_V = 0.0f;
// REQUIRED: enter measured storage capacitance in FARADS.
// Zero intentionally disables energy estimates. Example: 1000 uF = 0.001 F.
constexpr float CAPACITANCE_F = 0.0f;
constexpr float MAX_STORAGE_V = 5.0f;
constexpr unsigned SAMPLE_MS = 100;
constexpr unsigned REPORT_MS = 1000;
constexpr unsigned DEBOUNCE_MS = 25;
constexpr unsigned MIN_STEP_MS = 250;
constexpr unsigned ADC_SAMPLES = 16;
}
