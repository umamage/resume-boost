#!/usr/bin/env bash
# Start script for Render deployment

cd backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
