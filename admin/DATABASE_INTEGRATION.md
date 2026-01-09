# Database Integration

The bot system now automatically saves game session results to PostgreSQL database when configured.

## How It Works

1. **Automatic Detection**: The system checks if database credentials are configured in `.env` (DB_NAME or DB_HOST)
2. **Lazy Loading**: Database service is only imported if database is configured
3. **Dual Storage**: Results are saved to both:
   - **Excel file** (existing functionality)
   - **PostgreSQL database** (new, if configured)

## Configuration

Add these to your `.env` file:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=trivia_bots
DB_PASSWORD=your_password
DB_PORT=5432
```

## What Gets Saved

### Game Sessions (`game_sessions` table)
- Session ID
- Game URL
- League (auto-created if doesn't exist)
- Status (idle, running, completed, failed)
- Start/end times
- Duration
- Player counts (total, completed, failed)

### Player Results (`player_results` table)
- Session ID (foreign key)
- Player ID (matches players table)
- Questions answered
- Correct answers
- Accuracy percentage
- Final score
- Final rank
- Status

## Integration Points

The database integration is in:
- **Service**: `admin/backend/services/sessionService.js`
- **Integration**: `src/orchestrator/gameSession.js`

The integration is **non-blocking** - if database save fails, the bot continues normally and logs a warning.

## Viewing Results

Use the Admin Dashboard:
- Go to **Sessions** page to view all game sessions
- Click on a session to see detailed player results
- Use **GPT Analysis** page to generate insights from database results

## Migration Notes

- Existing Excel-based workflows continue to work
- Database integration is optional (works without DB)
- Players must exist in database (sync from Excel first)
- League names are auto-created if they don't exist


