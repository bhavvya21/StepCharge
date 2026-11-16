# Troubleshooting

## The app does not open

Extract the downloaded ZIP first. Open **app/StepCharge.html**, not `app/index.html`. The standalone HTML includes everything needed to show the readings and circuit; the modular index requires an HTTP server. GitHub's source viewer displays code rather than running the app.

If the file opens in a text editor, use your operating system's **Open with** menu and select a browser.

## Localhost does not respond

Localhost is optional. Open `app/StepCharge.html` directly instead. For development, keep `node app/serve.mjs` running while visiting `http://localhost:8080/app/`. A busy port or local network restriction can prevent the server from starting or being reached.

## Old text or buttons still appear

Close and reopen the downloaded HTML or refresh its browser tab. Confirm that you opened the latest file rather than an older copy in Downloads. After source changes, run `node app/build-standalone.mjs`; editing modular source alone does not update the bundled HTML.

## Only Export readings is visible

This is the intended final toolbar. Connect, import, animation, disconnect and new-window controls are hidden. The app starts with a fixed generated capture, so its values do not change when someone steps on a physical tile. Real measurements use the separate firmware and Python capture workflow.

## Export does not produce a visible file

Check the browser's Downloads list and any download-blocked prompt. The file uses the `.jsonl` extension and may be opened by a text editor rather than a spreadsheet. It contains one JSON object per line, not a single JSON array.

## Physical telemetry cannot be captured

Check the USB data cable, board firmware, selected serial port and 115200 baud setting. Close other serial monitors before starting `tools/capture.py`. Opening a serial port may restart the board. Verify the output in a serial monitor before investigating analysis errors.

## Energy is unavailable or analysis rejects a capture

Set measured capacitance in `firmware/StepCharge/config.h` and flash the board. A zero value intentionally disables energy reporting. Check sensor status and voltage limits. A valid analysis window needs at least two samples, constant positive capacitance, increasing timestamps, nondecreasing step counts and one session. Preserve rejected captures for diagnosis; collect a new valid window after fixing the cause.

See [TELEMETRY.md](TELEMETRY.md) for field/status definitions and [TESTING.md](TESTING.md) for the measurement procedure.
