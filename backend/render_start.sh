#!/usr/bin/env bash

# Debugging info
echo "Current directory: $(pwd)"
echo "Listing current directory:"
ls -la
echo "Listing app directory:"
ls -la app || echo "app directory not found"
echo "Python Version:"
python --version
echo "Python Path before export:"
python -c "import sys; print(sys.path)"

# Force PYTHONPATH to include current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)
echo "Python Path after export:"
python -c "import sys; print(sys.path)"

# Try import verification
python -c "import app.main; print('Import successful from script')" || echo "Import failed in script"

# Start application
echo "Starting uvicorn..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
