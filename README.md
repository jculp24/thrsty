# THRSTY App

THRSTY is a mobile-friendly web application that allows users to browse various soda fountain and freestyle machine locations, place pickup orders, and track their order status in real-time.

## Features

- **User Authentication**: Sign up, sign in, and manage user profiles
- **Vendor Browsing**: Browse nearby soda fountain vendors with ratings and information
- **Drink Selection**: View and select from a variety of soda fountain drinks
- **Cart Management**: Add items to cart, adjust quantities, and review orders
- **Order Pickup**: Place pickup orders from your favorite vendors
- **Real-time Updates**: Track order status in real-time
- **Order History**: View past orders and reorder favorites

## Technology Stack

### Frontend
- React with hooks for state management
- Tailwind CSS for styling
- Supabase client for authentication and data fetching
- Lucide React for icons

### Backend
- Node.js with Express.js
- Supabase for database and authentication
- Supabase real-time subscriptions for live updates

### Database
- PostgreSQL (via Supabase)
- Tables for users, vendors, drinks, orders, order items, and notifications

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/thrsty-app.git
cd thrsty-app
```

2. Install dependencies:
```
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```
# Backend (.env)
cp .env.example .env
# Update with your Supabase credentials

# Frontend (.env.local)
cp .env.example .env.local
# Update with your Supabase credentials
```

4. Set up Supabase:
- Create a new Supabase project
- Run the SQL migrations in `supabase/migrations` to set up the database schema

5. Start the development servers:
```
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## Deployment

### Backend Deployment (Heroku)
```
heroku create thrsty-backend
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Netlify/Vercel)
```
cd frontend
npm run build
# Deploy the build folder using Netlify/Vercel
```

## Project Structure

```
thrsty-app/
├── README.md
├── .gitignore
├── LICENSE
├── backend/
│   ├── index.js             # Entry point for Express server
│   ├── controllers/         # Route controllers
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── package.json         # Backend dependencies
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── supabaseClient.js # Supabase configuration
│   │   └── index.js         # Frontend entry point
│   └── package.json         # Frontend dependencies
└── supabase/
    └── migrations/          # Database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
