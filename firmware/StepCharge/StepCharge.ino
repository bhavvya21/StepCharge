/* StepCharge: USB-powered instrumentation for a piezoelectric harvesting tile.
 * Never connect a piezo disc directly to an ESP32 input.
 * See docs/HARDWARE.md before wiring. No charging control is implemented.
 */
#include <Arduino.h>
#include <esp_timer.h>
#include "config.h"

uint32_t steps = 0, session = 0;
uint32_t changedAt = 0, lastStepAt = 0, lastSample = 0, lastReport = 0;
bool rawPressed = false, stablePressed = false, armed = true, haveStep = false;
float adcMv = 0, storageV = 0;
uint32_t adcRaw = 0;
const char *status = "starting";

void resetSession() {
  steps = 0;
  ++session;
  haveStep = false;
  // A held switch at reset must be released before another step can count.
  rawPressed = stablePressed = digitalRead(Config::STEP_PIN) == LOW;
  armed = !stablePressed;
  changedAt = millis();
}

void pollStep(uint32_t now) {
  const bool pressed = digitalRead(Config::STEP_PIN) == LOW;
  if (pressed != rawPressed) { rawPressed = pressed; changedAt = now; }
  if (rawPressed != stablePressed && uint32_t(now - changedAt) >= Config::DEBOUNCE_MS) {
    stablePressed = rawPressed;
    if (!stablePressed) armed = true;
    else {
      if (armed && (!haveStep || uint32_t(now - lastStepAt) >= Config::MIN_STEP_MS)) {
        ++steps; lastStepAt = now; haveStep = true;
      }
      armed = false;
    }
  }
}

void sampleVoltage() {
  uint32_t sumMv = 0, sumRaw = 0;
  for (unsigned i = 0; i < Config::ADC_SAMPLES; ++i) {
    sumMv += analogReadMilliVolts(Config::VOLTAGE_PIN);
    sumRaw += analogRead(Config::VOLTAGE_PIN);
  }
  adcMv = float(sumMv) / Config::ADC_SAMPLES;
  adcRaw = sumRaw / Config::ADC_SAMPLES;
  storageV = (adcMv / 1000.0f) * (Config::TOP_OHMS + Config::BOTTOM_OHMS)
             / Config::BOTTOM_OHMS * Config::VOLTAGE_GAIN + Config::VOLTAGE_OFFSET_V;
  if (adcRaw >= 4000 || adcMv > 2800 || storageV > Config::MAX_STORAGE_V) status = "overrange";
  else if (adcMv < 150 || storageV < 0) status = "below_range";
  else if (Config::CAPACITANCE_F <= 0) status = "configure_capacitance";
  else status = "ok";
}

void report() {
  const uint64_t uptime = esp_timer_get_time() / 1000;
  Serial.printf("{\"schema\":1,\"session\":%lu,\"uptime_ms\":%llu,\"steps\":%lu,"
                "\"adc_raw\":%lu,\"adc_mv\":%.2f,\"storage_v\":%.5f,"
                "\"capacitance_f\":%.9f,\"status\":\"%s\",\"stored_energy_j\":",
                (unsigned long)session, (unsigned long long)uptime, (unsigned long)steps,
                (unsigned long)adcRaw, adcMv, storageV, Config::CAPACITANCE_F, status);
  if (strcmp(status, "ok") == 0)
    Serial.printf("%.9f", 0.5 * double(Config::CAPACITANCE_F) * storageV * storageV);
  else Serial.print("null");
  Serial.println("}");
}

void setup() {
  Serial.begin(115200);
  pinMode(Config::STEP_PIN, INPUT_PULLUP);
  pinMode(Config::VOLTAGE_PIN, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(Config::VOLTAGE_PIN, ADC_11db);
  resetSession();
  sampleVoltage();
}

void loop() {
  const uint32_t now = millis();
  pollStep(now);
  while (Serial.available()) {
    const char c = Serial.read();
    if (c == 'r' || c == 'R') resetSession();
  }
  if (uint32_t(now - lastSample) >= Config::SAMPLE_MS) {
    lastSample = now; sampleVoltage();
  }
  if (uint32_t(now - lastReport) >= Config::REPORT_MS) {
    lastReport = now; report();
  }
  delay(1);
}
