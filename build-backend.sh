#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit

# Disable Poetry auto-detection by removing pyproject.toml temporarily
cd backend
mv pyproject.toml pyproject.toml.bak 2>/dev/null || true
pip install -r requirements.txt
mv pyproject.toml.bak pyproject.toml 2>/dev/null || true
