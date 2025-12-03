/**
 * Trivia Bots - Main Entry Point
 * 
 * Scalable browser automation system for trivia games on Crowd.live
 */

import 'dotenv/config';
import { GameSession, createTestSession } from './orchestrator/gameSession.js';
import { sheetsLoader, createTestPlayers } from './players/googleSheetsLoader.js';
import logger from './utils/logger.js';
import config from './config/default.js';

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'run':
      await runGame(args.slice(1));
      break;
    case 'test':
      await runTestGame(args.slice(1));
      break;
    case 'load-players':
      await loadAndShowPlayers();
      break;
    case 'help':
    default:
      showHelp();
  }
}

/**
 * Run a game with players from Google Sheets
 * @param {array} args - Command arguments
 */
async function runGame(args) {
  const gameUrl = args[0] || config.game.url;
  const playerLimit = parseInt(args[1]) || 10;

  logger.info('=== Trivia Bots - Game Session ===');
  logger.info(`Game URL: ${gameUrl}`);
  logger.info(`Max players: ${playerLimit}`);

  try {
    // Load players from Google Sheets
    logger.info('Loading players from Google Sheets...');
    const players = await sheetsLoader.loadPlayers({ limit: playerLimit });

    if (players.length === 0) {
      logger.error('No players loaded. Check your Google Sheets configuration.');
      process.exit(1);
    }

    logger.info(`Loaded ${players.length} players`);

    // Create and run session
    const session = new GameSession({
      gameUrl,
      players,
      maxConcurrent: config.browser.maxConcurrent,
      headless: config.browser.headless,
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, stopping...');
      await session.stop();
      await session.cleanup();
      process.exit(0);
    });

    const results = await session.start();

    // Print results
    printResults(results);

    await session.cleanup();
  } catch (error) {
    logger.error('Game session failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Run a test game with generated players
 * @param {array} args - Command arguments
 */
async function runTestGame(args) {
  const gameUrl = args[0] || config.game.url;
  const playerCount = parseInt(args[1]) || 3;

  logger.info('=== Trivia Bots - Test Session ===');
  logger.info(`Game URL: ${gameUrl}`);
  logger.info(`Test players: ${playerCount}`);

  try {
    const session = createTestSession(gameUrl, playerCount, {
      maxConcurrent: Math.min(playerCount, config.browser.maxConcurrent),
      headless: config.browser.headless,
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, stopping...');
      await session.stop();
      await session.cleanup();
      process.exit(0);
    });

    const results = await session.start();

    // Print results
    printResults(results);

    await session.cleanup();
  } catch (error) {
    logger.error('Test session failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Load and display players from Google Sheets
 */
async function loadAndShowPlayers() {
  logger.info('Loading players from Google Sheets...');

  try {
    const players = await sheetsLoader.loadPlayers();

    console.log('\n=== Players ===\n');
    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.nickname}`);
      console.log(`   ID: ${player.id}`);
      console.log(`   Accuracy: ${(player.accuracy * 100).toFixed(0)}%`);
      console.log(`   Personality: ${player.personality}`);
      console.log(`   City: ${player.city || 'N/A'}`);
      console.log(`   Club: ${player.club || 'N/A'}`);
      console.log('');
    });

    console.log(`Total: ${players.length} players`);
  } catch (error) {
    logger.error('Failed to load players', { error: error.message });
  }
}

/**
 * Print game results
 * @param {object} results - Game results
 */
function printResults(results) {
  console.log('\n=== Game Results ===\n');
  console.log(`Session ID: ${results.sessionId}`);
  console.log(`Duration: ${results.duration?.toFixed(1)} seconds`);
  console.log(`Total Players: ${results.totalPlayers}`);
  console.log(`Completed: ${results.completed}`);
  console.log(`Failed: ${results.failed}`);

  if (results.players && Object.keys(results.players).length > 0) {
    console.log('\nPlayer Results:');
    Object.entries(results.players).forEach(([playerId, result]) => {
      if (result && !result.error) {
        const accuracy = result.questionsAnswered > 0
          ? ((result.correctAnswers / result.questionsAnswered) * 100).toFixed(1)
          : 'N/A';
        console.log(`  ${playerId}: ${result.correctAnswers}/${result.questionsAnswered} (${accuracy}%)`);
      } else {
        console.log(`  ${playerId}: ERROR - ${result?.error || 'Unknown error'}`);
      }
    });
  }

  console.log('');
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Trivia Bots - Scalable Browser Automation for Crowd.live

Usage:
  node src/index.js <command> [options]

Commands:
  run [url] [limit]     Run a game with players from Google Sheets
                        - url: Game URL (default: ${config.game.url})
                        - limit: Max players to use (default: 10)

  test [url] [count]    Run a test game with generated players
                        - url: Game URL (default: ${config.game.url})
                        - count: Number of test players (default: 3)

  load-players          Load and display players from Google Sheets

  help                  Show this help message

Environment Variables:
  GAME_URL              Default game URL
  GOOGLE_SHEETS_ID      Google Sheets spreadsheet ID
  MAX_CONCURRENT_BOTS   Maximum concurrent browser instances
  HEADLESS              Run browsers in headless mode (true/false)

Examples:
  node src/index.js test https://www.crowd.live/FNJCN 5
  node src/index.js run https://www.crowd.live/NOEPT 20
  node src/index.js load-players
`);
}

// Run main
main().catch(error => {
  logger.error('Fatal error', { error: error.message });
  process.exit(1);
});





