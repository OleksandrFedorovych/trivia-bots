/**
 * Game Session
 * 
 * Coordinates a complete trivia game session with multiple players.
 */

import PlayerPool from './playerPool.js';
import { createTestPlayers } from '../players/googleSheetsLoader.js';
import logger from '../utils/logger.js';
import config from '../config/default.js';

/**
 * Game Session class
 */
export class GameSession {
  constructor(options = {}) {
    this.gameUrl = options.gameUrl || config.game.url;
    this.players = options.players || [];
    this.pool = null;
    this.sessionId = `session-${Date.now()}`;
    this.startTime = null;
    this.endTime = null;
    this.status = 'idle'; // idle, initializing, running, completed, failed
    
    this.options = {
      maxConcurrent: options.maxConcurrent || config.browser.maxConcurrent,
      headless: options.headless ?? config.browser.headless,
      staggerDelay: options.staggerDelay || { min: 1000, max: 5000 },
    };
  }

  /**
   * Set the game URL
   * @param {string} url - Game URL
   */
  setGameUrl(url) {
    this.gameUrl = url;
    logger.info(`Game URL set: ${url}`);
  }

  /**
   * Set players for the session
   * @param {array} players - Array of player profiles
   */
  setPlayers(players) {
    this.players = players;
    logger.info(`${players.length} players set for session`);
  }

  /**
   * Add a player to the session
   * @param {object} player - Player profile
   */
  addPlayer(player) {
    this.players.push(player);
  }

  /**
   * Initialize the session
   */
  async initialize() {
    if (this.status !== 'idle') {
      throw new Error(`Cannot initialize session in ${this.status} state`);
    }

    this.status = 'initializing';
    logger.info(`Initializing session ${this.sessionId}`);

    // Create player pool
    this.pool = new PlayerPool({
      maxConcurrent: this.options.maxConcurrent,
      headless: this.options.headless,
    });

    // Add players to pool
    this.pool.addPlayers(this.players);

    logger.info(`Session initialized with ${this.players.length} players`);
  }

  /**
   * Start the game session
   * @returns {Promise<object>} Session results
   */
  async start() {
    if (!this.pool) {
      await this.initialize();
    }

    if (this.players.length === 0) {
      throw new Error('No players in session');
    }

    if (!this.gameUrl) {
      throw new Error('No game URL set');
    }

    this.status = 'running';
    this.startTime = new Date();
    logger.info(`Starting session ${this.sessionId} at ${this.startTime.toISOString()}`);
    logger.info(`Game URL: ${this.gameUrl}`);
    logger.info(`Players: ${this.players.length}`);

    try {
      const results = await this.pool.startAll(this.gameUrl, {
        staggerDelay: this.options.staggerDelay,
        maxConcurrent: this.options.maxConcurrent,
      });

      this.endTime = new Date();
      this.status = 'completed';

      const duration = (this.endTime - this.startTime) / 1000;
      logger.info(`Session completed in ${duration.toFixed(1)} seconds`);

      return {
        sessionId: this.sessionId,
        gameUrl: this.gameUrl,
        startTime: this.startTime,
        endTime: this.endTime,
        duration,
        ...results,
      };
    } catch (error) {
      this.status = 'failed';
      this.endTime = new Date();
      logger.error(`Session failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop the session
   */
  async stop() {
    logger.info(`Stopping session ${this.sessionId}`);
    
    if (this.pool) {
      await this.pool.stopAll();
    }

    this.status = this.status === 'running' ? 'stopped' : this.status;
    this.endTime = new Date();
  }

  /**
   * Get session status
   * @returns {object} Session status
   */
  getStatus() {
    return {
      sessionId: this.sessionId,
      status: this.status,
      gameUrl: this.gameUrl,
      playerCount: this.players.length,
      startTime: this.startTime,
      endTime: this.endTime,
      poolStats: this.pool?.getStats() || null,
    };
  }

  /**
   * Cleanup session resources
   */
  async cleanup() {
    if (this.pool) {
      await this.pool.clear();
      this.pool = null;
    }
    logger.info(`Session ${this.sessionId} cleaned up`);
  }
}

/**
 * Create a quick test session with generated players
 * @param {string} gameUrl - Game URL
 * @param {number} playerCount - Number of test players
 * @param {object} options - Session options
 * @returns {GameSession} Configured game session
 */
export function createTestSession(gameUrl, playerCount = 5, options = {}) {
  const players = createTestPlayers(playerCount);
  
  return new GameSession({
    gameUrl,
    players,
    ...options,
  });
}

export default GameSession;





