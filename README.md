# Physics

A physics learning web application focused on introductory concepts across multiple disciplines.

## Status
**In Development** - core v1 scaffold implemented

## Port
This application runs on port **4000**

## Getting Started
```bash
# from project root
./start.sh
```

The launcher script:
- creates `.venv` if missing
- installs dependencies from `requirements.txt`
- starts the Flask app on `http://127.0.0.1:4000`

## Manual Run (optional)
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

## V1 Features
- Topic learning with levels (`Basics`, `Intermediate`) across core disciplines
- Topic content auto-loads when discipline/topic/level changes (no manual lesson-load button)
- Generated visual diagrams for selected lessons
- Formula cheat-sheet panel for each selected lesson topic (equations, units, usage notes, rearrangements)
- Discipline/topic-aware simulations:
  - Mechanics: Kinematics, Newton's Laws
  - Electricity and Magnetism: Electric Fields, DC Circuits
  - Waves: Wave Properties, Sound
  - Thermodynamics: Temperature and Heat, Ideal Gas Basics
  - Optics: Lenses, Reflection and Refraction
- Discipline/topic-aware problem-solving flow with hint toggle, answer checking, step-by-step solution, unit-aware results/feedback, and formula reference
- Difficulty-aware problem generation and tolerance using the level selector (`Basics`, `Intermediate`)
- Client-side learning progress tracker (localStorage) with per-topic viewed/practiced status and reset control

## Hub Integration
This app is discoverable by the Codehome Hub and Project Manager applications.

## API Documentation
See `docs/API.md` for endpoint contracts and curl examples.

## Limitations (V1)
- Content is in-memory (no database persistence)
- Progress tracking is local-only in the browser (localStorage), not synced across devices
- No authentication or user accounts yet

