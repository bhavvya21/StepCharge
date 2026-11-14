"""Capture JSON telemetry from an ESP32. Ctrl+C closes and flushes the file."""
import argparse
import json
from pathlib import Path
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", required=True, help="COM5 or /dev/ttyUSB0")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        import serial
    except ImportError:
        parser.error("Install dependencies: python -m pip install -r tools/requirements.txt")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation protects earlier experimental results.
    with args.output.open("x", encoding="utf-8") as output:
        with serial.Serial(args.port, 115200, timeout=1) as device:
            print("Recording; opening the serial port may reboot the ESP32. Ctrl+C to stop.")
            try:
                while True:
                    line = device.readline().decode("utf-8", errors="replace").strip()
                    if not line:
                        continue
                    try:
                        record = json.loads(line)
                        if not isinstance(record, dict) or record.get("schema") != 1:
                            raise ValueError("Not StepCharge telemetry")
                    except (ValueError, json.JSONDecodeError):
                        print("Skipped non-telemetry line", file=sys.stderr)
                        continue
                    output.write(json.dumps(record, allow_nan=False) + "\n")
                    output.flush()
                    print(f"{record.get('storage_v')} V | {record.get('steps')} steps | {record.get('status')}")
            except KeyboardInterrupt:
                print("\nCapture saved.")


if __name__ == "__main__":
    main()
