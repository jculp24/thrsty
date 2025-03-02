#!/bin/bash

# THRSTY App Setup Script

echo "Setting up THRSTY App..."

# Create directories
mkdir -p frontend/src/components
mkdir -p backend/controllers
mkdir -p backend/routes
mkdir -p backend/middleware
mkdir -p supabase/migrations

# Move files to the right locations
# Frontend
cp -r frontend/* frontend/
# Backend
cp -r backend/* backend/
# Supabase
cp -r supabase/* supabase/

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Setup environment variables
echo "Setting up environment variables..."
cd ../backend
cp .env.example .env
echo "Please update backend/.env with your Supabase credentials"

cd ../frontend
cp .env.example .env.local
echo "Please update frontend/.env.local with your Supabase credentials"

# Final instructions
echo "Setup complete!"
echo "Now you need to:"
echo "1. Create a Supabase project"
echo "2. Run the SQL migrations in supabase/migrations/"
echo "3. Update the .env files with your Supabase credentials"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm start"
echo ""
echo "See SETUP_GUIDE.md for detailed instructions"