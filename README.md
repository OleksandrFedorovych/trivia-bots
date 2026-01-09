# Trivia Bots - Scalable Browser Automation System

A comprehensive browser automation system for running AI-controlled players in Crowd.live trivia games. This system simulates human-like behavior with unique player profiles, manages game sessions, and provides a full admin dashboard for managing leagues, players, and game analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Development](#project-development)
- [Features](#features)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Admin Dashboard](#admin-dashboard)
- [Database Integration](#database-integration)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)

---

## 🎯 Overview

This project provides a scalable solution for running multiple AI-controlled players in Crowd.live trivia games. The system:

- **Simulates Human Behavior**: Each bot has unique accuracy rates, reaction times, and personality traits
- **Scales from 10 to 1000+ Players**: Built with concurrent browser automation using Playwright
- **Manages Complete Game Lifecycle**: From player registration to game completion and result tracking
- **Provides Analytics Dashboard**: Full admin interface for viewing game history, player stats, and generating GPT-powered analysis

**Target Platform**: [Crowd.live](https://www.crowd.live) trivia games

---

## 🚀 Project Development

The project was developed in **4 major milestones**:

### ✅ Milestone 1: Architecture & Core Bot Engine (MVP, 10–50 bots)
**Status: COMPLETED**

Developed the foundational bot system:
- ✅ Browser automation with Playwright
- ✅ Single and multi-bot execution
- ✅ Human-like behavior engine (accuracy, timing, personality)
- ✅ Game state detection and question handling
- ✅ Excel data import (TYSN Universe player profiles)
- ✅ Support for multiple question types (multiple choice, number input, text input, true/false, drag-and-drop, image-based)
- ✅ Concurrent player orchestration (up to 100+ simultaneous bots)
- ✅ Error recovery and auto-reconnect mechanisms
- ✅ Comprehensive logging system

### ✅ Milestone 2: Scaling & Game Orchestration (towards 100s/1,000+ bots)
**Status: COMPLETED**

Built scalable infrastructure:
- ✅ Game session orchestration with PlayerPool
- ✅ Automatic game scheduler (weekly NFL & Hockey leagues)
- ✅ Docker containerization for deployment
- ✅ Results persistence (Excel output + database)
- ✅ Team-based player grouping
- ✅ Performance optimization for high concurrency

### ✅ Milestone 3: Admin Dashboard + GPT Content Hooks
**Status: COMPLETED**

Created complete admin system:
- ✅ PostgreSQL database with full schema (players, sessions, results, leagues, GPT content)
- ✅ Express.js REST API backend
- ✅ Next.js admin dashboard (React/TypeScript)
- ✅ Player management (sync from Excel, view/edit profiles)
- ✅ Game session history and analytics
- ✅ League management
- ✅ GPT integration for game analysis and storylines
- ✅ Automatic database initialization on startup
- ✅ Database persistence when bots run

### 🔄 Milestone 4: Testing, Load Simulation & Hardening
**Status: IN PROGRESS**

- ⏳ Load testing (1000+ concurrent bots)
- ⏳ Monitoring dashboard
- ⏳ Advanced error handling
- ⏳ Performance benchmarking

---

## ✨ Features

### Bot Automation
- 🤖 **Browser Automation**: Playwright-based automation for joining and playing trivia games
- 🎭 **Human-Like Behavior**: Each bot has unique timing patterns, accuracy rates, and personality traits (fast, cautious, random, normal)
- 📊 **Excel Data Import**: Load player profiles from TYSN Universe Excel file (`players.xlsx`)
- 🔄 **Concurrent Players**: Support for 10-1000+ simultaneous players
- 📈 **Behavior Engine**: Simulates hot/cold streaks, fatigue, and decision-making patterns
- 🎯 **Configurable Accuracy**: Set accuracy rates per player (e.g., 63%-82%)
- 🔁 **Error Recovery**: Automatic retry and reconnection on failures
- 📝 **Comprehensive Logging**: Detailed step-by-step logs for debugging

### Game Management
- 📅 **Game Scheduler**: Automatic weekly game scheduling (NFL & Hockey leagues)
- 👥 **Team Support**: Run bots by team/club
- 🔍 **Multiple Question Types**: Handles multiple choice, number input, text input, true/false, drag-and-drop, image questions
- ⏱️ **Staggered Joining**: Realistic player join timing to avoid detection

### Admin Dashboard
- 📊 **Player Management**: View, sync, and edit player profiles from Excel
- 📈 **Game Session History**: View all game sessions with detailed analytics
- 🏆 **League Management**: Organize games by leagues
- 🤖 **GPT Integration**: Generate game analysis, weekly recaps, and sponsor scripts
- 🔄 **Real-time Updates**: Refresh session data to see latest game results

### Data Persistence
- 💾 **Database Storage**: PostgreSQL database for all game data
- 📄 **Excel Export**: Results automatically saved to `results.xlsx`
- 🔄 **Automatic Sync**: Game results automatically saved when bots complete

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │     │
│  │  (Next.js)   │◄─┤  (Express)   │◄─┤   Database   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ (API calls, data sync)
                            │
┌─────────────────────────────────────────────────────────────┐
│                  BOT AUTOMATION SYSTEM                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Game Session Manager                   │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │            Player Pool                       │   │    │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ... ┌─────┐        │   │    │
│  │  │  │ Bot │ │ Bot │ │ Bot │     │ Bot │        │   │    │
│  │  │  │  1  │ │  2  │ │  3  │ ... │  N  │        │   │    │
│  │  │  └─────┘ └─────┘ └─────┘     └─────┘        │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  │                                                      │    │
│  │  • Behavior Engine                                  │    │
│  │  • Game State Detection                             │    │
│  │  • Page Actions (Playwright)                        │    │
│  │  • Results Writer                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Crowd.live Platform                        │
│              (Trivia Game Website)                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Bot System** (`src/crowdlive/`)
   - `triviaBot.js`: Main bot implementation
   - `pageActions.js`: Low-level browser interactions
   - `gameState.js`: Game state detection and management

2. **Orchestration** (`src/orchestrator/`)
   - `gameSession.js`: Manages complete game sessions
   - `playerPool.js`: Handles concurrent browser instances

3. **Player Management** (`src/players/`)
   - `excelLoader.js`: Loads player profiles from Excel
   - `behaviorEngine.js`: Human-like behavior simulation
   - `resultsWriter.js`: Saves results to Excel

4. **Admin Dashboard** (`admin/`)
   - `backend/`: Express.js API server
   - `frontend/`: Next.js React dashboard

---

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (for admin dashboard, optional for bot-only usage)
- Playwright browsers

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd trivia-bots
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install chromium
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Crowd.live Game Configuration
GAME_URL=https://www.crowd.live/FNJCN

# Bot Configuration
MAX_CONCURRENT_BOTS=100
HEADLESS=true
LOG_LEVEL=info

# Database Configuration (for admin dashboard)
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# Admin Backend Configuration
ADMIN_PORT=3001

# OpenAI API Key (for GPT analysis)
OPENAI_API_KEY=your_openai_api_key

# Excel Data File (optional, defaults to src/data/players.xlsx)
PLAYERS_FILE=src/data/players.xlsx
```

### Step 4: Prepare Player Data

Place your `players.xlsx` file in `src/data/`. The Excel file should contain player profiles with columns:
- Participant ID
- Participant Name (Nickname)
- Email
- Phone
- Percent Correct (Accuracy 0-100)
- Team/Club (optional)

### Step 5: Set Up Admin Dashboard (Optional)

If you want to use the admin dashboard:

```bash
# Install backend dependencies
cd admin/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ../..
```

### Step 6: Initialize Database (if using admin dashboard)

The database schema is automatically created when the backend starts. Make sure your PostgreSQL database is running and accessible with the credentials in your `.env` file.

Start the admin backend:
```bash
npm run admin:server
```

The database tables will be created automatically on first run.

---

## 🎮 Usage

### Running Bots

#### Single Bot (Testing)
```bash
npm run bot
```

#### Multiple Bots
```bash
npm run bots:10      # Run 10 bots
npm run bots:25      # Run 25 bots
npm run bots:50      # Run 50 bots
npm run bots:100     # Run 100 bots
```

#### Custom Game URL
```bash
node src/runMultipleBots.js 10 https://www.crowd.live/NOEPT
```

#### Run by Team
```bash
# List available teams
npm run teams

# Run bots for a specific team
node src/runMultipleBots.js --team "Team Name" https://www.crowd.live/FNJCN
```

### Game Scheduler

The scheduler automatically runs games at scheduled times:

- **NFL Trivia**: Thursday, Sunday, Monday at 9:35pm EST
- **Hockey Trivia**: Saturday at 7:40pm EST

```bash
# Start scheduler (runs continuously)
npm run scheduler

# Check next scheduled games
npm run scheduler:status

# Run a game immediately
npm run scheduler:nfl
npm run scheduler:hockey
```

To keep the scheduler running continuously, use PM2:
```bash
npm install -g pm2
pm2 start src/runScheduler.js --name "trivia-scheduler"
pm2 logs trivia-scheduler
pm2 stop trivia-scheduler
```

### Admin Dashboard

#### Start Admin Backend
```bash
npm run admin:server
# or for development with auto-reload
npm run admin:dev
```

#### Start Admin Frontend
```bash
npm run admin:frontend
```

Access the dashboard at `http://localhost:3000`

#### Admin Dashboard Features

1. **Players Page** (`/players`)
   - View all players from database
   - Sync players from Excel file
   - View player statistics

2. **Sessions Page** (`/sessions`)
   - View all game session history
   - See session details (players, results, timing)
   - Filter by status, league, date

3. **Leagues Page** (`/leagues`)
   - Manage leagues
   - Create/edit leagues
   - View league statistics

4. **GPT Analysis Page** (`/gpt`)
   - Generate game-to-game analysis
   - Generate weekly analysis
   - Create sponsor scripts

---

## 💾 Database Integration

### Automatic Data Persistence

When you run bots (`npm run bots:10`), the system automatically:

1. **On Session Start**: Creates a database record with status `'running'`
2. **On Session Complete**: Saves complete results including:
   - Session metadata (URL, start/end time, duration)
   - Player counts (total, completed, failed)
   - Individual player results (questions answered, correct answers, accuracy, final score, rank)

### Database Schema

The system uses PostgreSQL with the following main tables:

- **`leagues`**: League/team information
- **`players`**: Player profiles (synced from Excel)
- **`game_sessions`**: Game session records
- **`player_results`**: Individual player results per session
- **`scheduled_games`**: Scheduled game configuration
- **`gpt_content`**: GPT-generated analysis and content
- **`system_logs`**: System monitoring logs

### Viewing Results in Admin Dashboard

1. Run bots: `npm run bots:10`
2. Wait for completion (check logs for "Results saved to database")
3. Open admin dashboard: `http://localhost:3000/sessions`
4. Click "🔄 Refresh" to see the latest session
5. Click on a session ID to view detailed results

---

## 🚢 Deployment

### Render.com Deployment

The admin dashboard is configured for deployment on Render.com:

**Backend (Web Service)**:
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: Set `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `OPENAI_API_KEY`
- `PORT` is automatically provided by Render

**Frontend (Web Service)**:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables: Set `NEXT_PUBLIC_API_URL` to your backend URL
- `PORT` is automatically provided by Render

See `admin/backend/README.md` and `admin/frontend/README.md` for detailed deployment instructions.

### Docker Deployment

For the bot automation system:

```bash
# Build Docker image
npm run docker:build

# Run scheduler
npm run docker:run

# Run manual game
npm run docker:game

# Scale workers
npm run docker:scale
```

---

## 📁 Project Structure

```
trivia-bots/
├── src/                          # Bot automation system
│   ├── config/                   # Configuration files
│   │   ├── default.js           # Default settings
│   │   └── selectors.js         # DOM selectors for Crowd.live
│   ├── crowdlive/               # Bot implementation
│   │   ├── triviaBot.js         # Main bot class
│   │   ├── pageActions.js       # Browser interactions
│   │   └── gameState.js         # Game state detection
│   ├── orchestrator/            # Multi-bot orchestration
│   │   ├── gameSession.js       # Session management
│   │   └── playerPool.js        # Concurrent player pool
│   ├── players/                 # Player management
│   │   ├── excelLoader.js       # Load from Excel
│   │   ├── behaviorEngine.js    # Behavior simulation
│   │   ├── playerSchema.js      # Player data schema
│   │   └── resultsWriter.js     # Save results to Excel
│   ├── scheduler/               # Game scheduler
│   │   └── gameScheduler.js     # Automatic scheduling
│   ├── utils/                   # Utilities
│   │   ├── logger.js            # Winston logger
│   │   └── timing.js            # Timing helpers
│   ├── data/                    # Data files
│   │   └── players.xlsx         # Player profiles
│   ├── bot.js                   # Single bot runner
│   ├── runMultipleBots.js       # Multi-bot runner
│   └── runScheduler.js          # Scheduler runner
│
├── admin/                       # Admin dashboard
│   ├── backend/                 # Express.js API
│   │   ├── db/                  # Database
│   │   │   ├── index.js         # Connection & initialization
│   │   │   └── schema.sql       # Database schema
│   │   ├── routes/              # API routes
│   │   │   ├── players.js       # Player endpoints
│   │   │   ├── sessions.js      # Session endpoints
│   │   │   ├── leagues.js       # League endpoints
│   │   │   └── gpt.js           # GPT endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── sessionService.js    # Session persistence
│   │   │   └── gptService.js        # GPT integration
│   │   ├── utils/               # Utilities
│   │   │   └── logger.js        # Backend logger
│   │   └── server.js            # Express server
│   │
│   └── frontend/                # Next.js dashboard
│       ├── app/                 # Next.js app directory
│       │   ├── players/         # Players page
│       │   ├── sessions/        # Sessions page
│       │   ├── leagues/         # Leagues page
│       │   └── gpt/             # GPT page
│       └── lib/                 # Client utilities
│           └── api.ts           # API client
│
├── .env                         # Environment variables (create this)
├── package.json                 # Dependencies
├── docker-compose.yml           # Docker configuration
└── README.md                    # This file
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GAME_URL` | Default Crowd.live game URL | `https://www.crowd.live/FNJCN` |
| `MAX_CONCURRENT_BOTS` | Maximum concurrent bots | `100` |
| `HEADLESS` | Run browsers in headless mode | `true` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `DB_USER` | PostgreSQL username | - |
| `DB_HOST` | PostgreSQL host | - |
| `DB_NAME` | PostgreSQL database name | - |
| `DB_PASSWORD` | PostgreSQL password | - |
| `DB_PORT` | PostgreSQL port | `5432` |
| `ADMIN_PORT` | Admin backend port | `3001` |
| `OPENAI_API_KEY` | OpenAI API key for GPT features | - |
| `PLAYERS_FILE` | Path to players Excel file | `src/data/players.xlsx` |

### Player Profile Schema

Players loaded from Excel are converted to this internal format:

```javascript
{
  id: string,              // Unique identifier
  nickname: string,        // Display name
  name: string,            // Full name
  email: string,           // Email address
  phone: string,           // Phone number
  accuracy: number,        // 0.0-1.0 (correct answer rate)
  personality: string,     // 'fast', 'cautious', 'random', 'normal'
  team: string,            // Team/club name
  reactionTime: {          // Timing configuration
    min: number,
    max: number,
    average: number
  }
}
```

---

## 🛠️ Development

### Running in Development Mode

```bash
# Bot with auto-reload
npm run dev

# Admin backend with auto-reload
npm run admin:dev

# Admin frontend (Next.js dev server)
npm run admin:frontend

# Run with visible browser (for debugging)
HEADLESS=false npm run bot
```

### Testing

```bash
# Run test bot
npm run test
```

### Adjusting Selectors

If Crowd.live changes their HTML structure, update `src/config/selectors.js`.

### Adding Behavior Patterns

Modify `src/players/behaviorEngine.js` to add new behavior patterns.

### API Documentation

See `admin/backend/API.md` for complete API documentation.

---

## 📊 Where to See Details

### Viewing Game History

1. **Admin Dashboard**: `http://localhost:3000/sessions`
   - Complete session history
   - Player results per session
   - League analytics

2. **Excel Files**:
   - `src/data/results.xlsx` - Individual player results
   - Session summaries automatically saved

3. **Database**:
   - Direct PostgreSQL queries
   - Tables: `game_sessions`, `player_results`, `players`

### Viewing Player Profiles

1. **Admin Dashboard**: `http://localhost:3000/players`
   - View all players
   - Sync from Excel
   - Edit player data

2. **Excel File**: `src/data/players.xlsx`
   - Source of truth for player data

### Viewing Logs

- **Console Output**: Real-time logs when running bots
- **Log Files**: `logs/combined.log` and `logs/error.log`
- **Admin Backend Logs**: `admin/backend/logs/`

---

## 🎯 How It's Made

### Technologies Used

- **Bot Automation**: Playwright (browser automation)
- **Backend**: Node.js, Express.js
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **AI Integration**: OpenAI GPT API
- **Data Processing**: ExcelJS (xlsx package)
- **Logging**: Winston
- **Containerization**: Docker, Docker Compose

### Key Design Decisions

1. **Modular Architecture**: Separated bot logic, orchestration, and admin dashboard
2. **Lazy Loading**: Database integration only loads if environment variables are set
3. **Error Recovery**: Bots automatically retry and reconnect on failures
4. **Human-like Behavior**: Realistic timing, accuracy variations, and decision patterns
5. **Scalability**: Built to handle 10-1000+ concurrent bots

---

## 📝 License

ISC

## 👤 Author

Oleksandr Fedorovych

---

## 🆘 Troubleshooting

### Bots not saving to database

- Check that `DB_NAME` and `DB_HOST` are set in `.env`
- Verify database connection (check backend logs)
- Ensure database schema is initialized (automatically done on backend start)

### Admin dashboard not showing sessions

- Make sure admin backend is running (`npm run admin:server`)
- Check that frontend is pointing to correct API URL (`NEXT_PUBLIC_API_URL`)
- Refresh the sessions page

### Players not loading from Excel

- Verify `src/data/players.xlsx` exists
- Check Excel file format matches expected schema
- Check logs for Excel parsing errors

---

For more details, see:
- `admin/backend/API.md` - API documentation
- `admin/backend/README.md` - Backend setup
- `admin/frontend/README.md` - Frontend setup
