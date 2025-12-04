/**
 * Multi-Bot Runner
 * 
 * Runs multiple trivia bots on a Crowd.live game
 * 
 * Usage: node src/runMultipleBots.js [botCount] [gameUrl]
 */

import { GameSession, createTestSession } from './orchestrator/gameSession.js';
import { createTestPlayers } from './players/googleSheetsLoader.js';
import logger from './utils/logger.js';

// Configuration
const DEFAULT_BOT_COUNT = 5;
const DEFAULT_GAME_URL = 'https://www.crowd.live/FNJCN';

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const botCount = parseInt(args[0]) || DEFAULT_BOT_COUNT;
  const gameUrl = args[1] || DEFAULT_GAME_URL;

  console.log('========================================');
  console.log('        MULTI-BOT RUNNER');
  console.log('========================================');
  console.log(`Game URL: ${gameUrl}`);
  console.log(`Bot Count: ${botCount}`);
  console.log(`Max Concurrent: 5`);
  console.log('========================================');
  console.log('');

  // Create test players
  const players = createTestPlayers(botCount);

  console.log('Players to join:');
  players.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.nickname} (Accuracy: ${(p.accuracy * 100).toFixed(0)}%, ${p.personality})`);
  });
  console.log('');

  // Create game session
  const session = new GameSession({
    gameUrl,
    players,
    maxConcurrent: 5,
    headless: false, // Set to true for production
    staggerDelay: { min: 2000, max: 5000 },
  });

  try {
    // Start the session
    console.log('Starting game session...');
    console.log('');

    const results = await session.start();

    // Print results
    console.log('');
    console.log('========================================');
    console.log('        SESSION RESULTS');
    console.log('========================================');
    console.log(`Session ID: ${results.sessionId}`);
    console.log(`Duration: ${results.duration.toFixed(1)} seconds`);
    console.log(`Total Players: ${results.totalPlayers}`);
    console.log(`Completed: ${results.completed}`);
    console.log(`Failed: ${results.failed}`);
    console.log('');

    // Print individual results
    console.log('Player Results:');
    for (const [playerId, playerResult] of Object.entries(results.players)) {
      if (playerResult.error) {
        console.log(`  ❌ ${playerId}: ERROR - ${playerResult.error}`);
      } else {
        console.log(`  ✓ ${playerId}: ${playerResult.correctAnswers}/${playerResult.questionsAnswered} correct (${playerResult.accuracy})`);
      }
    }
    console.log('========================================');

  } catch (error) {
    console.error('Session failed:', error.message);
  } finally {
    await session.cleanup();
  }
}

// Run
main().catch(console.error);

