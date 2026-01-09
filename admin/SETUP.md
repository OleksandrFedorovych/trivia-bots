# Admin Dashboard Setup Guide

Complete setup guide for the Trivia Bots Admin Dashboard.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** (v18+)
3. **OpenAI API Key** (optional, for GPT features)

## Step 1: Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE trivia_bots;
```

2. Add database credentials to `.env` file in project root:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=trivia_bots
DB_PASSWORD=your_password
DB_PORT=5432
```

## Step 2: Backend Setup

1. Backend dependencies are already installed (in root `package.json`)

2. Start the backend API server:
```bash
npm run admin:server
```

The API will be available at: http://localhost:3001

3. The database schema will be automatically created on first run.

## Step 3: Frontend Setup

1. Install frontend dependencies:
```bash
cd admin/frontend
npm install
```

2. Start the frontend development server:
```bash
npm run admin:frontend
```

Or from the frontend directory:
```bash
cd admin/frontend
npm run dev
```

The dashboard will be available at: http://localhost:3000

## Step 4: Configure OpenAI (Optional)

Add to `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
```

This enables GPT analysis features (game-to-game, week-to-week analysis, sponsor scripts).

## Usage

### 1. Sync Players from Excel

1. Go to **Players** page
2. Click **"Sync from Excel"** button
3. Players will be loaded from `src/data/players.xlsx` and synced to database

### 2. View Game Sessions

1. Go to **Sessions** page
2. View all game sessions and results
3. Click on a session to see detailed results

### 3. Generate GPT Analysis

1. Go to **GPT Analysis** page
2. Select a completed session
3. Click **"Generate Game Analysis"** to get insights
4. Use **"Generate Weekly Analysis"** to compare multiple sessions

### 4. Manage Leagues

1. Go to **Leagues** page
2. Click **"Create League"** to add a new league
3. View league details and player counts

## Running Both Servers

You need both servers running:

**Terminal 1** (Backend API):
```bash
npm run admin:server
```

**Terminal 2** (Frontend Dashboard):
```bash
npm run admin:frontend
```

## API Documentation

See `admin/backend/API.md` for complete API documentation.

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE trivia_bots;`

### API Connection Error
- Make sure backend server is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in frontend if using custom API URL

### GPT Analysis Not Working
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key has sufficient credits
- Ensure session has completed and has results


