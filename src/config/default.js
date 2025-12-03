import 'dotenv/config';

export const config = {
  // Game settings
  game: {
    url: process.env.GAME_URL || 'https://www.crowd.live/FNJCN',
    waitTimeout: 30000,
    questionTimeout: 15000,
  },

  // Browser settings
  browser: {
    headless: process.env.HEADLESS === 'true',
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_BOTS) || 10,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },

  // Google Sheets settings
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    ranges: {
      players: 'Players!A2:Z',
      cities: 'Cities!A2:Z',
      clubs: 'Clubs!A2:Z',
    },
  },

  // Timing settings (for human-like behavior)
  timing: {
    minJoinDelay: parseInt(process.env.MIN_JOIN_DELAY) || 1000,
    maxJoinDelay: parseInt(process.env.MAX_JOIN_DELAY) || 5000,
    minAnswerDelay: 1500,
    maxAnswerDelay: 10000,
    typingDelay: { min: 50, max: 150 }, // ms per character
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;





