#!/bin/bash
# Physics App Launcher
# Port: 4000

set -e

echo "Starting Physics app on port 4000..."

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
python -m pip install --disable-pip-version-check -r requirements.txt

python app.py
