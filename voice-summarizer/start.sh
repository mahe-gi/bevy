#!/bin/bash

echo "🚀 Starting Voice Summarizer App..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""

# Function to cleanup processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit
}

# Trap cleanup function
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3
echo "✅ Backend started successfully"

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm run dev

# Keep script running
wait