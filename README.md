# Trivia Bots

Scalable browser automation system for trivia games on Crowd.live. This system simulates human-like behavior to create AI-controlled avatar players that compete in online trivia games.

## Features

- 🤖 **Browser Automation**: Playwright-based automation for joining and playing trivia games
- 🎭 **Human-Like Behavior**: Each bot has unique timing patterns, accuracy rates, and personality traits
- 📊 **Excel Data Import**: Load player profiles from TYSN Universe Excel file
- 🔄 **Concurrent Players**: Support for 10-50+ simultaneous players (scalable to 1000+)
- 📈 **Behavior Engine**: Simulates hot/cold streaks, fatigue, and decision-making patterns
- 🎯 **Configurable Accuracy**: Set accuracy rates per player (e.g., 63%-82%)
- 📅 **Game Scheduler**: Automatic weekly game scheduling (NFL & Hockey)

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
│   ├── playerSchema.js     # Player profile schema
│   ├── behaviorEngine.js   # Human-like behavior simulation
│   └── excelLoader.js      # Excel file loader
├── orchestrator/
│   ├── playerPool.js   # Manages multiple browser instances
│   └── gameSession.js  # Coordinates game sessions
├── scheduler/
│   └── gameScheduler.js # Automatic game scheduling
├── data/
│   └── players.xlsx    # Player profiles (TYSN Universe)
├── utils/
│   ├── logger.js       # Winston logger
│   └── timing.js       # Timing utilities
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
4. Place your player data Excel file:
   ```
   src/data/players.xlsx
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Crowd.live Game Configuration
GAME_URL=https://www.crowd.live/FNJCN

# Bot Configuration
MAX_CONCURRENT_BOTS=10
HEADLESS=false
LOG_LEVEL=info
```

### Player Data (Excel File)

Place your `players.xlsx` file in `src/data/`. The Excel file should have a sheet with these columns:

| Column | Description |
|--------|-------------|
| Participant ID | Unique identifier |
| Participant Name | Full name |
| Email | Email address |
| Phone | Phone number |
| Percent Correct | Accuracy percentage (0-100) |
| Team | Team/Club name (optional) |

The bot automatically converts this to the internal player format.

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

## Usage

### Run a Game Session

```bash
npm run bot                 # Single bot test
npm run bots:5              # 5 bots
npm run bots:10             # 10 bots
npm run bots:25             # 25 bots
node src/runMultipleBots.js 10 https://www.crowd.live/NOEPT  # Custom URL
```

### View Loaded Players

```bash
node src/index.js load-players
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

### Command Reference

```bash
node src/index.js help    # Show all commands
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run bot` | Run single bot |
| `npm run bots` | Run multi-bot (default 5) |
| `npm run bots:5` | Run 5 bots |
| `npm run bots:10` | Run 10 bots |
| `npm run bots:25` | Run 25 bots |
| `npm run scheduler` | Start game scheduler |
| `npm run scheduler:status` | Show scheduler status |
| `npm run scheduler:nfl` | Run NFL game now |
| `npm run scheduler:hockey` | Run Hockey game now |

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
