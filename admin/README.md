# Admin Dashboard

Admin dashboard and API for managing trivia bots, leagues, games, and analytics.

## Structure

```
admin/
├── backend/          # Express API server
│   ├── db/          # Database schema and connection
│   ├── routes/      # API routes
│   ├── models/      # Data models
│   └── server.js    # Express server entry point
└── frontend/        # React/Next.js dashboard (coming soon)
```

## Setup

### 1. Database Setup

Make sure PostgreSQL is installed and running.

Create a database:
```sql
CREATE DATABASE trivia_bots;
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=trivia_bots
DB_PASSWORD=your_password
DB_PORT=5432

# Admin API
ADMIN_PORT=3001
```

### 3. Initialize Database

The database schema will be automatically created when you start the server for the first time.

Or manually run:
```bash
psql -U postgres -d trivia_bots -f admin/backend/db/schema.sql
```

### 4. Start Admin Server

```bash
npm run admin:server
```

The API will be available at: http://localhost:3001

## API Endpoints

(Coming soon - endpoints will be added as we build the dashboard)

- `GET /api/health` - Health check

## Next Steps

1. ✅ Database schema created
2. ✅ Basic Express server setup
3. 🔲 API routes (players, games, sessions, leagues)
4. 🔲 Frontend dashboard (React/Next.js)
5. 🔲 GPT integration for content generation


