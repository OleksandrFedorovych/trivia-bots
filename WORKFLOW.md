# Trivia Bots - Workflow Documentation

This document describes the complete workflows for using the Trivia Bots system, from initial setup to running games and viewing results.

---

## 📋 Table of Contents

- [Initial Setup Workflow](#initial-setup-workflow)
- [Daily Operations Workflow](#daily-operations-workflow)
- [Running Game Sessions](#running-game-sessions)
- [Managing Players](#managing-players)
- [Viewing Results](#viewing-results)
- [Scheduled Games Workflow](#scheduled-games-workflow)
- [Admin Dashboard Workflow](#admin-dashboard-workflow)
- [Troubleshooting Workflow](#troubleshooting-workflow)

---

## 🚀 Initial Setup Workflow

### Step 1: Install Dependencies

```bash
# Clone repository (if not already done)
git clone <repository-url>
cd trivia-bots

# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Step 2: Configure Environment

Create `.env` file in root directory:

```env
# Required for bots
GAME_URL=https://www.crowd.live/FNJCN
MAX_CONCURRENT_BOTS=100
HEADLESS=true

# Required for admin dashboard
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
ADMIN_PORT=3001

# Optional (for GPT features)
OPENAI_API_KEY=your_key_here
```

### Step 3: Prepare Player Data

1. Place `players.xlsx` in `src/data/` directory
2. Ensure Excel file has required columns:
   - Participant ID
   - Participant Name (Nickname)
   - Email
   - Phone
   - Percent Correct (Accuracy 0-100)
   - Team/Club (optional)

### Step 4: Initialize Database (if using admin dashboard)

```bash
# Start admin backend (creates tables automatically)
npm run admin:server

# Wait for "✅ Database schema initialized" message
# Then stop with Ctrl+C
```

### Step 5: Verify Setup

```bash
# Test single bot
npm run bot

# Check players loaded
node src/index.js load-players
```

---

## 📅 Daily Operations Workflow

### Morning: Check System Status

```bash
# Check scheduler status
npm run scheduler:status

# Check recent logs
tail -f logs/combined.log

# Check admin dashboard
# Visit: http://localhost:3000
```

### Before Game: Prepare Players

1. **Update Excel File** (if needed)
   - Edit `src/data/players.xlsx`
   - Add/remove players
   - Update accuracy rates

2. **Sync Players to Database** (via admin dashboard)
   - Open: `http://localhost:3000/players`
   - Click "🔄 Sync from Excel"
   - Verify players appear in list

### During Game: Monitor Progress

```bash
# Run bots
npm run bots:10

# Watch logs in real-time
# Look for:
# - "Bot initialized"
# - "Joined game"
# - "QUESTION X STARTED"
# - "Results saved to database"
```

### After Game: Review Results

1. **View in Admin Dashboard**
   - Open: `http://localhost:3000/sessions`
   - Click "🔄 Refresh"
   - Find latest session
   - Click session ID to view details

2. **Check Excel Output**
   - Open: `src/data/results.xlsx`
   - Review session results

---

## 🎮 Running Game Sessions

### Workflow: Manual Game Session

```
┌─────────────────────────────────────────┐
│ 1. START ADMIN DASHBOARD (if needed)   │
│    npm run admin:server                 │
│    npm run admin:frontend               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. PREPARE GAME                         │
│    • Get game URL from Crowd.live       │
│    • Verify players.xlsx is updated     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. RUN BOTS                             │
│    npm run bots:10 <game_url>           │
│                                         │
│    System automatically:                │
│    • Loads players from Excel           │
│    • Creates game session               │
│    • Initializes bots                   │
│    • Registers players                  │
│    • Plays game                         │
│    • Collects results                   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 4. SAVE RESULTS                         │
│    Automatically saves to:              │
│    • Excel: src/data/results.xlsx       │
│    • Database: game_sessions table      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 5. VIEW RESULTS                         │
│    • Check console output               │
│    • Open admin dashboard               │
│    • View session history               │
└─────────────────────────────────────────┘
```

### Workflow: Team-Based Session

```bash
# 1. List available teams
npm run teams

# Output shows:
#   📋 Team Name 1: 25 players
#   📋 Team Name 2: 18 players
#   ...

# 2. Run bots for specific team
node src/runMultipleBots.js --team "Team Name 1" <game_url>

# System will:
# - Load only players from that team
# - Run bots with those players
# - Save results with team association
```

### Workflow: High-Volume Session (100+ bots)

```bash
# 1. Ensure sufficient resources
# Check available memory: ~200MB per bot

# 2. Configure concurrency
# In .env: MAX_CONCURRENT_BOTS=100

# 3. Run with staggered timing
npm run bots:100 <game_url>

# System will:
# - Queue bots if over limit
# - Stagger joining times
# - Monitor resource usage
```

---

## 👥 Managing Players

### Workflow: Adding New Players

```
┌─────────────────────────────────────────┐
│ 1. EDIT EXCEL FILE                      │
│    • Open: src/data/players.xlsx        │
│    • Add new row with player data       │
│    • Fill required columns:             │
│      - Participant ID                   │
│      - Participant Name                 │
│      - Email                            │
│      - Phone                            │
│      - Percent Correct                  │
│    • Save file                          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. SYNC TO DATABASE                     │
│    Option A: Via Admin Dashboard        │
│    • Open: http://localhost:3000/players│
│    • Click "🔄 Sync from Excel"         │
│    • Wait for confirmation              │
│                                         │
│    Option B: Via API                    │
│    POST /api/players/sync               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. VERIFY                               │
│    • Check players list in dashboard    │
│    • Verify new player appears          │
│    • Check player details are correct   │
└─────────────────────────────────────────┘
```

### Workflow: Updating Player Accuracy

```
1. Edit Excel: src/data/players.xlsx
   - Find player row
   - Update "Percent Correct" column
   - Save file

2. Sync to Database:
   - Admin Dashboard → Players → Sync

3. Verify:
   - Check player accuracy in dashboard
   - Or run: node src/index.js load-players
```

### Workflow: Deactivating Players

```
Option 1: Via Admin Dashboard
1. Open: http://localhost:3000/players
2. Find player
3. Click "Edit" or "Delete"
4. Set active=false or delete

Option 2: Via API
PUT /api/players/:id
Body: { "active": false }

Option 3: Remove from Excel
- Remove row from players.xlsx
- Sync (will delete from database)
```

---

## 📊 Viewing Results

### Workflow: View Recent Sessions

```
┌─────────────────────────────────────────┐
│ 1. START ADMIN DASHBOARD                │
│    npm run admin:server                 │
│    npm run admin:frontend               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. NAVIGATE TO SESSIONS                 │
│    • Open: http://localhost:3000        │
│    • Click "Sessions" in navigation     │
│    • Or go to: http://localhost:3000/   │
│      sessions                           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. VIEW SESSION LIST                    │
│    • See all sessions (sorted by date)  │
│    • View:                               │
│      - Session ID                        │
│      - League                            │
│      - Status (completed/running/failed) │
│      - Start Time                        │
│      - Player Counts                     │
│    • Click "🔄 Refresh" for latest      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 4. VIEW SESSION DETAILS                 │
│    • Click on Session ID                │
│    • See detailed information:          │
│      - All players in session           │
│      - Individual results               │
│      - Scores and rankings              │
│      - Timing information               │
└─────────────────────────────────────────┘
```

### Workflow: Export Results

```
Option 1: Excel File (Automatic)
- Results automatically saved to:
  src/data/results.xlsx
- Open in Excel/LibreOffice

Option 2: Database Query
- Connect to PostgreSQL
- Query: SELECT * FROM game_sessions
- Query: SELECT * FROM player_results

Option 3: API Export
GET /api/sessions/:id
GET /api/sessions/:id/results
```

### Workflow: Generate GPT Analysis

```
┌─────────────────────────────────────────┐
│ 1. NAVIGATE TO GPT PAGE                 │
│    http://localhost:3000/gpt            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. SELECT SESSION                       │
│    • Choose session from dropdown       │
│    • Or enter session ID                │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. GENERATE ANALYSIS                    │
│    • Click "Generate Game Analysis"     │
│    • Wait for GPT to process            │
│    • View generated analysis            │
│                                         │
│    Or:                                  │
│    • Select multiple sessions           │
│    • Generate "Weekly Analysis"         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 4. USE CONTENT                          │
│    • Copy analysis text                 │
│    • Use for recaps/scripts             │
│    • Content saved in database          │
└─────────────────────────────────────────┘
```

---

## ⏰ Scheduled Games Workflow

### Workflow: Set Up Scheduler

```
┌─────────────────────────────────────────┐
│ 1. CONFIGURE SCHEDULES                  │
│    Edit: src/scheduler/gameScheduler.js │
│    • Set game times                     │
│    • Set game URLs                      │
│    • Configure leagues                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. START SCHEDULER                      │
│    Option A: Direct run                 │
│    npm run scheduler                    │
│                                         │
│    Option B: With PM2 (recommended)     │
│    pm2 start src/runScheduler.js        │
│      --name "trivia-scheduler"          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. MONITOR                              │
│    • Check status:                      │
│      npm run scheduler:status           │
│    • View logs:                         │
│      pm2 logs trivia-scheduler          │
│    • Check next scheduled game          │
└─────────────────────────────────────────┘
```

### Workflow: Scheduler Executes Game

```
When scheduled time arrives:

┌─────────────────────────────────────────┐
│ 1. SCHEDULER TRIGGERS                   │
│    • Detects scheduled time             │
│    • Loads league players               │
│    • Creates GameSession                │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. BOTS EXECUTE                         │
│    • Same as manual execution           │
│    • Automatically saves results        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. RESULTS SAVED                        │
│    • Database updated                   │
│    • Excel file updated                 │
│    • Scheduler logs completion          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 4. NEXT SCHEDULE                        │
│    • Calculate next game time           │
│    • Wait for next scheduled time       │
└─────────────────────────────────────────┘
```

### Workflow: Manual Trigger (Emergency Run)

```bash
# Run scheduled game immediately
npm run scheduler:nfl      # NFL game
npm run scheduler:hockey   # Hockey game

# Or via command:
node src/runScheduler.js run nfl
node src/runScheduler.js run hockey
```

---

## 🖥️ Admin Dashboard Workflow

### Workflow: Starting Admin Dashboard

```
┌─────────────────────────────────────────┐
│ 1. START BACKEND                        │
│    Terminal 1:                          │
│    npm run admin:server                 │
│                                         │
│    Wait for:                            │
│    "🚀 Admin API server running"        │
│    "✅ Database schema initialized"     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. START FRONTEND                       │
│    Terminal 2:                          │
│    npm run admin:frontend               │
│                                         │
│    Wait for:                            │
│    "Ready on http://localhost:3000"     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. ACCESS DASHBOARD                     │
│    Open browser:                        │
│    http://localhost:3000                │
│                                         │
│    Verify pages load correctly          │
└─────────────────────────────────────────┘
```

### Workflow: Player Management

```
1. View Players
   • Navigate to: /players
   • See all players from database
   • Filter by league, team, active status

2. Sync from Excel
   • Click "🔄 Sync from Excel"
   • Wait for sync to complete
   • Review sync results (created/updated)

3. Edit Player
   • Click on player
   • Modify details
   • Save changes

4. View Statistics
   • See player count
   • See average accuracy
   • See team distribution
```

### Workflow: Session Analysis

```
1. View Sessions
   • Navigate to: /sessions
   • See all game sessions
   • Filter by status, league, date

2. View Details
   • Click session ID
   • See complete session data
   • View individual player results

3. Generate Analysis
   • Navigate to: /gpt
   • Select session
   • Generate analysis
   • View GPT-generated content
```

---

## 🔧 Troubleshooting Workflow

### Workflow: Bots Not Saving to Database

```
┌─────────────────────────────────────────┐
│ 1. CHECK ENVIRONMENT VARIABLES          │
│    • Verify .env file exists            │
│    • Check DB_NAME and DB_HOST are set  │
│    • Verify database credentials        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. TEST DATABASE CONNECTION             │
│    • Start admin backend                │
│    • Check for connection errors        │
│    • Verify schema initialization       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 3. CHECK LOGS                           │
│    • Run bots with LOG_LEVEL=debug      │
│    • Look for:                          │
│      - "Database integration enabled"   │
│      - "Results saved to database"      │
│    • Check for error messages           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 4. VERIFY DATABASE                      │
│    • Connect to PostgreSQL              │
│    • Check tables exist                 │
│    • Verify data in game_sessions       │
└─────────────────────────────────────────┘
```

### Workflow: Players Not Loading

```
1. Check Excel File
   • Verify src/data/players.xlsx exists
   • Check file is not corrupted
   • Verify required columns exist

2. Check Excel Format
   • Open file in Excel
   • Verify data in correct columns
   • Check for empty rows at top

3. Test Load
   • Run: node src/index.js load-players
   • Check for error messages
   • Verify players are listed

4. Check Logs
   • Review logs/combined.log
   • Look for Excel parsing errors
```

### Workflow: Admin Dashboard Not Loading

```
1. Check Backend
   • Verify backend is running
   • Check: http://localhost:3001/api/health
   • Review backend logs

2. Check Frontend
   • Verify frontend is running
   • Check: http://localhost:3000
   • Review browser console for errors

3. Check API Connection
   • Verify NEXT_PUBLIC_API_URL in .env
   • Should be: http://localhost:3001/api
   • Check CORS configuration

4. Check Database
   • Verify database is accessible
   • Check connection in backend logs
   • Test database queries
```

---

## 📝 Quick Reference Workflows

### Daily Checklist

```bash
☐ Check scheduler status
☐ Verify players.xlsx is up to date
☐ Sync players to database (if updated)
☐ Run scheduled games (or manual)
☐ Check session results in dashboard
☐ Review logs for errors
```

### Weekly Checklist

```bash
☐ Generate weekly analysis (GPT)
☐ Review player performance
☐ Update player accuracy rates
☐ Backup database
☐ Backup results.xlsx
☐ Review system logs
```

### Monthly Checklist

```bash
☐ Analyze trends in sessions
☐ Update game schedules (if needed)
☐ Review and optimize bot behavior
☐ Check system performance
☐ Update documentation
```

---

For specific technical details, see `ARCHITECTURE.md` and source code documentation.

