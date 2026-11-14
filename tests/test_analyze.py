import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from analyze import analyze


def trial(v0=1.0, v1=2.0, steps=10):
    return [
        dict(schema=1, session=1, status="ok", uptime_ms=1000, steps=0, capacitance_f=0.001, storage_v=v0),
        dict(schema=1, session=1, status="ok", uptime_ms=11000, steps=steps, capacitance_f=0.001, storage_v=v1),
    ]


class EnergyTests(unittest.TestCase):
    def test_known_capacitor_charge(self):
        result = analyze(trial())
        self.assertAlmostEqual(result["net_capacitor_energy_j"], 0.0015)
        self.assertAlmostEqual(result["average_net_storage_power_w"], 0.00015)
        self.assertAlmostEqual(result["net_energy_per_step_j"], 0.00015)

    def test_discharge_stays_negative(self):
        self.assertLess(analyze(trial(2, 1))["net_capacitor_energy_j"], 0)

    def test_no_steps(self):
        self.assertIsNone(analyze(trial(steps=0))["net_energy_per_step_j"])

    def test_reject_invalid_trials(self):
        changes = [("session", 2), ("uptime_ms", 500), ("steps", -1),
                   ("status", "overrange"), ("storage_v", float("nan")),
                   ("capacitance_f", 0), ("schema", 2)]
        for key, value in changes:
            with self.subTest(key=key):
                records = copy.deepcopy(trial())
                records[-1][key] = value
                with self.assertRaises(ValueError):
                    analyze(records)

    def test_reject_short_trial(self):
        with self.assertRaises(ValueError):
            analyze(trial()[:1])


if __name__ == "__main__":
    unittest.main()
