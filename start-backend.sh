#!/usr/bin/env bash
# Start script for Render deployment

uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
