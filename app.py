import os
from io import BytesIO
from typing import Optional

from flask import Flask, jsonify, render_template, request, send_file
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


app = Flask(__name__)
LEVELS = ("basics", "intermediate")


CONTENT = {
    "Mechanics": {
        "topics": {
            "Kinematics": {
                "basics": (
                    "Kinematics describes motion using position, velocity, and acceleration. "
                    "For constant acceleration, position follows a quadratic curve over time."
                ),
                "intermediate": (
                    "In 2D kinematics, horizontal and vertical motion are independent under "
                    "uniform gravity. Parametric equations model trajectory and time-of-flight."
                ),
            },
            "Newton's Laws": {
                "basics": (
                    "Forces change motion. Net force causes acceleration, and every interaction "
                    "has equal and opposite reaction forces."
                ),
                "intermediate": (
                    "Use free-body diagrams to resolve forces and apply sum(F)=ma along each axis. "
                    "Constraints and friction models determine coupled acceleration."
                ),
            },
        }
    },
    "Waves": {
        "topics": {
            "Wave Properties": {
                "basics": (
                    "Waves transfer energy without net transport of matter. "
                    "Amplitude, wavelength, and frequency describe a wave."
                ),
                "intermediate": (
                    "Wave speed satisfies v=f*lambda. Superposition allows constructive and "
                    "destructive interference for overlapping waveforms."
                ),
            },
            "Sound": {
                "basics": (
                    "Sound is a longitudinal wave in a medium. Higher frequency means higher pitch."
                ),
                "intermediate": (
                    "Resonance and standing waves explain harmonics in air columns and strings."
                ),
            },
        }
    },
    "Electricity and Magnetism": {
        "topics": {
            "Electric Fields": {
                "basics": (
                    "Charges create electric fields. Positive test charges move along field direction."
                ),
                "intermediate": (
                    "Field strength scales with inverse-square distance for point charges. "
                    "Potential and field gradients are linked."
                ),
            },
            "DC Circuits": {
                "basics": "Current is flow of charge. Ohm's law links voltage, current, and resistance.",
                "intermediate": (
                    "Use Kirchhoff's rules to solve multi-loop circuits and determine branch currents."
                ),
            },
        }
    },
    "Thermodynamics": {
        "topics": {
            "Temperature and Heat": {
                "basics": "Heat transfers due to temperature differences by conduction, convection, or radiation.",
                "intermediate": (
                    "Specific heat and latent heat quantify energy transfer in temperature change and phase transitions."
                ),
            },
            "Ideal Gas Basics": {
                "basics": "Ideal gas behavior links pressure, volume, and temperature.",
                "intermediate": (
                    "PV=nRT and process paths (isothermal, isobaric, adiabatic) describe state changes."
                ),
            },
        }
    },
    "Optics": {
        "topics": {
            "Reflection and Refraction": {
                "basics": "Light reflects with equal incidence and reflection angles; it refracts at boundaries.",
                "intermediate": (
                    "Snell's law predicts bend angle across media and lens equations predict image formation."
                ),
            },
            "Lenses": {
                "basics": "Converging lenses focus parallel rays; diverging lenses spread rays.",
                "intermediate": (
                    "Use 1/f = 1/do + 1/di and magnification relations to solve image distance and size."
                ),
            },
        }
    },
}

FORMULAS = {
    "Mechanics": {
        "Kinematics": [
            {
                "name": "Constant Acceleration Position",
                "equation": "x = x0 + v0*t + 0.5*a*t^2",
                "variables": "x: position, x0: initial position, v0: initial velocity, a: acceleration, t: time",
                "units": "x (m), v0 (m/s), a (m/s^2), t (s)",
                "rearrangements": [
                    "x - x0 = v0*t + 0.5*a*t^2",
                    "a = 2*(x - x0 - v0*t)/t^2",
                ],
                "when_to_use": "Use for 1D motion problems with constant acceleration.",
            },
            {
                "name": "Velocity-Time",
                "equation": "v = v0 + a*t",
                "variables": "v: final velocity, v0: initial velocity, a: acceleration, t: time",
                "units": "v (m/s), v0 (m/s), a (m/s^2), t (s)",
                "rearrangements": ["a = (v - v0)/t", "t = (v - v0)/a"],
                "when_to_use": "Use to connect velocity change and acceleration over time.",
            },
            {
                "name": "Projectile Range",
                "equation": "R = v^2*sin(2*theta)/g",
                "variables": "R: range, v: launch speed, theta: launch angle, g: gravity",
                "units": "R (m), v (m/s), g (m/s^2), theta (degrees/radians)",
                "rearrangements": ["v = sqrt(R*g/sin(2*theta))"],
                "when_to_use": "Use for level-ground projectile motion with negligible air resistance.",
            },
        ],
        "Newton's Laws": [
            {
                "name": "Newton's Second Law",
                "equation": "F_net = m*a",
                "variables": "F_net: net force, m: mass, a: acceleration",
                "units": "F_net (N), m (kg), a (m/s^2)",
            }
        ],
    },
    "Waves": {
        "Wave Properties": [
            {
                "name": "Wave Speed",
                "equation": "v = f*lambda",
                "variables": "v: wave speed, f: frequency, lambda: wavelength",
                "units": "v (m/s), f (Hz), lambda (m)",
            }
        ],
        "Sound": [
            {
                "name": "Wave Speed in Medium",
                "equation": "v = f*lambda",
                "variables": "v: sound speed, f: frequency, lambda: wavelength",
                "units": "v (m/s), f (Hz), lambda (m)",
            }
        ],
    },
    "Electricity and Magnetism": {
        "Electric Fields": [
            {
                "name": "Point Charge Field",
                "equation": "E = k*q/r^2",
                "variables": "E: field magnitude, k: Coulomb constant, q: charge, r: distance",
                "units": "E (N/C), q (C), r (m)",
            }
        ],
        "DC Circuits": [
            {
                "name": "Ohm's Law",
                "equation": "V = I*R",
                "variables": "V: voltage, I: current, R: resistance",
                "units": "V (V), I (A), R (ohm)",
            }
        ],
    },
    "Thermodynamics": {
        "Temperature and Heat": [
            {
                "name": "Heat Transfer",
                "equation": "Q = m*c*DeltaT",
                "variables": "Q: heat, m: mass, c: specific heat, DeltaT: temperature change",
                "units": "Q (J), m (kg), c (J/kg*K), DeltaT (K or C)",
            }
        ],
        "Ideal Gas Basics": [
            {
                "name": "Ideal Gas Law",
                "equation": "P*V = n*R*T",
                "variables": "P: pressure, V: volume, n: moles, R: gas constant, T: temperature",
                "units": "P (Pa), V (m^3), T (K)",
            }
        ],
    },
    "Optics": {
        "Reflection and Refraction": [
            {
                "name": "Snell's Law",
                "equation": "n1*sin(theta1) = n2*sin(theta2)",
                "variables": "n1,n2: refractive indices, theta1/theta2: angles from normal",
                "units": "n (unitless), theta (degrees or radians)",
            }
        ],
        "Lenses": [
            {
                "name": "Thin Lens Equation",
                "equation": "1/f = 1/do + 1/di",
                "variables": "f: focal length, do: object distance, di: image distance",
                "units": "f, do, di (same distance units)",
            }
        ],
    },
}


def _discipline_payload():
    payload = []
    for discipline, data in CONTENT.items():
        payload.append(
            {
                "name": discipline,
                "topics": sorted(list(data["topics"].keys())),
            }
        )
    return sorted(payload, key=lambda item: item["name"])


def _lookup_topic(discipline: str, topic: str) -> Optional[dict]:
    data = CONTENT.get(discipline)
    if not data:
        return None
    return data["topics"].get(topic)


def _lookup_formulas(discipline: str, topic: str):
    topics = FORMULAS.get(discipline, {})
    formulas = topics.get(topic, [])
    enriched = []
    for formula in formulas:
        enriched.append(
            {
                "name": formula["name"],
                "equation": formula["equation"],
                "variables": formula["variables"],
                "units": formula["units"],
                "rearrangements": formula.get("rearrangements", []),
                "when_to_use": formula.get("when_to_use", "Use for this topic's standard problem pattern."),
            }
        )
    return enriched


def _error(message: str, status_code: int):
    return jsonify({"error": message}), status_code


def _render_diagram(discipline: str, topic: str):
    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=120)

    if discipline == "Mechanics":
        x = np.linspace(0, 20, 200)
        y = -0.15 * (x - 10) ** 2 + 15
        y = np.maximum(y, 0)
        ax.plot(x, y, color="#2563eb", linewidth=2)
        ax.set_title(f"{topic}: Projectile-like trajectory")
        ax.set_xlabel("Horizontal distance")
        ax.set_ylabel("Vertical height")
    elif discipline == "Waves":
        x = np.linspace(0, 4 * np.pi, 300)
        ax.plot(x, np.sin(x), color="#0891b2", linewidth=2, label="Wave")
        ax.plot(x, 0.5 * np.sin(x + np.pi / 3), color="#64748b", linewidth=1.5, label="Second wave")
        ax.set_title(f"{topic}: Wave visualization")
        ax.set_xlabel("Position")
        ax.set_ylabel("Displacement")
        ax.legend(loc="upper right")
    elif discipline == "Electricity and Magnetism":
        r = np.linspace(0.3, 4, 200)
        e = 1 / (r**2)
        ax.plot(r, e, color="#7c3aed", linewidth=2)
        ax.set_title(f"{topic}: Field strength vs distance")
        ax.set_xlabel("Distance (r)")
        ax.set_ylabel("Relative field (1/r^2)")
    elif discipline == "Thermodynamics":
        v = np.linspace(1, 10, 200)
        p = 8 / v
        ax.plot(v, p, color="#ea580c", linewidth=2)
        ax.set_title(f"{topic}: Simple P-V relationship")
        ax.set_xlabel("Volume")
        ax.set_ylabel("Pressure")
    elif discipline == "Optics":
        ax.axhline(0, color="#0f172a", linewidth=1)
        ax.axvline(2.5, color="#2563eb", linewidth=2)
        ax.plot([0.2, 2.5], [1.2, 0.2], color="#16a34a", linewidth=2)
        ax.plot([2.5, 5.5], [0.2, -0.6], color="#dc2626", linewidth=2)
        ax.set_xlim(0, 6)
        ax.set_ylim(-1.5, 1.5)
        ax.set_title(f"{topic}: Ray passing through boundary")
        ax.set_xlabel("Distance")
        ax.set_ylabel("Height")
    else:
        x = np.linspace(0, 10, 100)
        ax.plot(x, np.sin(x), linewidth=2)
        ax.set_title("Physics concept diagram")

    ax.grid(alpha=0.2)
    fig.tight_layout()

    buf = BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return buf


@app.route("/")
def home():
    return render_template("index.html")


@app.get("/api/disciplines")
def disciplines():
    return jsonify({"disciplines": _discipline_payload()})


@app.get("/api/lesson")
def lesson():
    discipline = request.args.get("discipline", "").strip()
    topic = request.args.get("topic", "").strip()
    level = request.args.get("level", "basics").strip().lower()

    if not discipline or not topic:
        return _error("discipline and topic are required", 400)

    topic_data = _lookup_topic(discipline, topic)
    if not topic_data:
        return _error("topic not found for discipline", 404)

    if level not in LEVELS:
        level = "basics"

    return jsonify(
        {
            "discipline": discipline,
            "topic": topic,
            "level": level,
            "lesson": topic_data[level],
            "available_levels": list(LEVELS),
        }
    )


@app.get("/api/diagram")
def diagram():
    discipline = request.args.get("discipline", "").strip()
    topic = request.args.get("topic", "").strip()

    if not discipline or not topic:
        return _error("discipline and topic are required", 400)

    topic_data = _lookup_topic(discipline, topic)
    if not topic_data:
        return _error("topic not found for discipline", 404)

    try:
        image = _render_diagram(discipline, topic)
    except Exception:
        return _error("failed to render diagram", 500)
    return send_file(image, mimetype="image/png")


@app.get("/api/formulas")
def formulas():
    discipline = request.args.get("discipline", "").strip()
    topic = request.args.get("topic", "").strip()

    if not discipline or not topic:
        return _error("discipline and topic are required", 400)

    topic_data = _lookup_topic(discipline, topic)
    if not topic_data:
        return _error("topic not found for discipline", 404)

    return jsonify(
        {
            "discipline": discipline,
            "topic": topic,
            "formulas": _lookup_formulas(discipline, topic),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4000"))
    app.run(host="0.0.0.0", port=port, debug=False)
