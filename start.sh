#!/bin/bash
# Physics App Launcher — uses Hub-provided PORT when started from Codehome Hub.
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

PY="$APP_DIR/.venv/bin/python3"
if [ ! -x "$PY" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
  PY="$APP_DIR/.venv/bin/python3"
fi

# Do not use `source .venv/bin/activate`: if the project was moved, activate may still
# point VIRTUAL_ENV at an old path and break PATH (python: command not found).

DEPS_STAMP="$APP_DIR/.venv/.hub_deps_installed"
if [ ! -f "$DEPS_STAMP" ] || [ "$APP_DIR/requirements.txt" -nt "$DEPS_STAMP" ]; then
  echo "Installing Python dependencies..."
  "$PY" -m pip install --disable-pip-version-check -r "$APP_DIR/requirements.txt"
  touch "$DEPS_STAMP"
fi

echo "Starting Physics app (PORT=${PORT:-4000})..."
exec "$PY" "$APP_DIR/app.py"
