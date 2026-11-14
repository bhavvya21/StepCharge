"""Calculate signed net capacitor energy change, not gross generation."""
import argparse
import json
import math
from pathlib import Path


def number(record, name):
    value = record.get(name)
    if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value):
        raise ValueError(f"Invalid numeric field: {name}")
    return value


def analyze(records):
    if len(records) < 2:
        raise ValueError("At least two valid samples are required")
    previous = None
    capacitance = number(records[0], "capacitance_f")
    if capacitance <= 0:
        raise ValueError("Configure measured capacitance before collecting energy data")
    for record in records:
        if record.get("schema") != 1 or record.get("status") != "ok":
            raise ValueError("Capture includes invalid/unconfigured measurements; collect a valid trial")
        if number(record, "storage_v") < 0 or number(record, "steps") < 0:
            raise ValueError("Negative voltage or step count")
        if number(record, "capacitance_f") != capacitance:
            raise ValueError("Capacitance changed within capture")
        if previous is not None:
            if record.get("session") != previous.get("session"):
                raise ValueError("Session reset detected; use a separate capture for each trial")
            if number(record, "uptime_ms") <= number(previous, "uptime_ms"):
                raise ValueError("Reboot or non-monotonic sample time detected")
            if number(record, "steps") < number(previous, "steps"):
                raise ValueError("Step counter reset detected")
        previous = record
    first, last = records[0], records[-1]
    elapsed = (last["uptime_ms"] - first["uptime_ms"]) / 1000.0
    delta = 0.5 * capacitance * (last["storage_v"] ** 2 - first["storage_v"] ** 2)
    steps = last["steps"] - first["steps"]
    return {
        "samples": len(records), "duration_s": elapsed, "steps_in_window": steps,
        "initial_voltage_v": first["storage_v"], "final_voltage_v": last["storage_v"],
        "net_capacitor_energy_j": delta, "average_net_storage_power_w": delta / elapsed,
        "net_energy_per_step_j": delta / steps if steps else None,
        "interpretation": "Signed net storage change; excludes energy already consumed or lost. Not gross harvested energy.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("capture", type=Path)
    args = parser.parse_args()
    try:
        records = [json.loads(line) for line in args.capture.read_text(encoding="utf-8").splitlines() if line.strip()]
        if not all(isinstance(record, dict) for record in records):
            raise ValueError("Each line must be a JSON object")
        print(json.dumps(analyze(records), indent=2, allow_nan=False))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Cannot analyze capture: {error}\n")


if __name__ == "__main__":
    main()
