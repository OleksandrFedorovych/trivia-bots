# Trivia Bots

Scalable browser automation system for trivia games on Crowd.live. This system simulates human-like behavior to create AI-controlled avatar players that compete in online trivia games.

## Features

- 🤖 **Browser Automation**: Playwright-based automation for joining and playing trivia games
- 🎭 **Human-Like Behavior**: Each bot has unique timing patterns, accuracy rates, and personality traits
- 📊 **Google Sheets Integration**: Load player profiles from Google Sheets
- 🔄 **Concurrent Players**: Support for 10-50+ simultaneous players (scalable to 1000+)
- 📈 **Behavior Engine**: Simulates hot/cold streaks, fatigue, and decision-making patterns
- 🎯 **Configurable Accuracy**: Set accuracy rates per player (e.g., 63%-82%)

## Project Structure

```
src/
├── config/
│   ├── default.js      # Configuration settings
│   └── selectors.js    # Crowd.live DOM selectors
├── crowdlive/
│   ├── pageActions.js  # Low-level page interactions
│   ├── gameState.js    # Game state detection
│   └── triviaBot.js    # Complete bot implementation
├── players/
│   ├── playerSchema.js       # Player profile schema
│   ├── behaviorEngine.js     # Human-like behavior simulation
│   └── googleSheetsLoader.js # Google Sheets integration
├── orchestrator/
│   ├── playerPool.js   # Manages multiple browser instances
│   └── gameSession.js  # Coordinates game sessions
├── scheduler/
│   └── gameScheduler.js # Automatic game scheduling
├── utils/
│   ├── logger.js       # Winston logger
│   └── timing.js       # Timing utilities
├── data/
│   └── samplePlayers.json  # Sample player data
├── bot.js              # Single bot runner
├── runMultipleBots.js  # Multi-bot runner
├── runScheduler.js     # Scheduler runner
└── index.js            # Main entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```
4. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Crowd.live Game Configuration
GAME_URL=https://www.crowd.live/FNJCN

# Google Sheets Configuration (optional)
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Bot Configuration
MAX_CONCURRENT_BOTS=10
HEADLESS=false
LOG_LEVEL=info
```

### Google Sheets Setup

1. Create a Google Cloud project
2. Enable the Google Sheets API
3. Create a service account and download credentials
4. Share your spreadsheet with the service account email
5. Add credentials to `.env`

### Player Profile Schema

Players can have the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique player identifier |
| `nickname` | string | Display name in game |
| `name` | string | Full name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `accuracy` | number | Correct answer rate (0.0-1.0) |
| `personality` | string | `fast`, `cautious`, `random`, `normal` |
| `reactionTime` | object | `{ min, max, average }` in milliseconds |
| `lateJoinChance` | number | Probability of joining late (0.0-1.0) |
| `noShowChance` | number | Probability of not showing up (0.0-1.0) |

## Usage

### Run a Test Session

Run with generated test players:

```bash
npm run bot                 # Single bot test
npm run bots:5              # 5 bots test
npm run bots:10             # 10 bots test  
npm run bots:25             # 25 bots test
node src/index.js test https://www.crowd.live/FNJCN 5  # Custom URL, 5 players
```

### Run with Google Sheets Players

```bash
node src/index.js run https://www.crowd.live/FNJCN 20  # 20 players from sheets
```

### Game Scheduler (Automatic Weekly Games)

The scheduler automatically runs games at scheduled times:
- **NFL Trivia**: Thursday, Sunday, Monday at 9:35pm EST
- **Hockey Trivia**: Saturday at 7:40pm EST

```bash
npm run scheduler           # Start scheduler daemon (runs continuously)
npm run scheduler:status    # Check next scheduled game times
npm run scheduler:nfl       # Run NFL game immediately
npm run scheduler:hockey    # Run Hockey game immediately
```

To keep the scheduler running continuously, use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/runScheduler.js --name "trivia-scheduler"
pm2 logs trivia-scheduler   # View logs
pm2 stop trivia-scheduler   # Stop scheduler
```

### View Loaded Players

```bash
node src/index.js load-players
```

### Command Reference

```bash
node src/index.js help    # Show all commands
```

## Scaling

### Phase 1: 10-50 Players
- Single machine with multiple browser contexts
- Set `MAX_CONCURRENT_BOTS=50` in `.env`
- Monitor memory usage (~200MB per browser)

### Phase 2: 100-1000+ Players
- Docker containers with process managers
- Redis for job coordination
- Multiple worker nodes
- Load balancing

## Development

### Running in Development

```bash
npm run dev               # Watch mode
HEADLESS=false npm run bot  # Visual debugging
```

### Adjusting Selectors

If Crowd.live changes their HTML structure, update `src/config/selectors.js`.

### Adding Behavior Patterns

Modify `src/players/behaviorEngine.js` to add new behavior patterns.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Session                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Player Pool                        │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │ Bot 1   │ │ Bot 2   │ │ Bot 3   │ │ Bot N   │   │    │
│  │  │┌───────┐│ │┌───────┐│ │┌───────┐│ │┌───────┐│   │    │
│  │  ││Browser││ ││Browser││ ││Browser││ ││Browser││   │    │
│  │  │└───────┘│ │└───────┘│ │└───────┘│ │└───────┘│   │    │
│  │  │ Profile │ │ Profile │ │ Profile │ │ Profile │   │    │
│  │  │ Behavior│ │ Behavior│ │ Behavior│ │ Behavior│   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Crowd.live Platform                       │
└─────────────────────────────────────────────────────────────┘
```

## License

ISC

## Author

Oleksandr Fedorovych





