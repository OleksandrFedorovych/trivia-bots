/**
 * Trivia Bot
 * 
 * Complete bot implementation that joins games and plays trivia.
 */

import { chromium } from 'playwright';
import config from '../config/default.js';
import PageActions from './pageActions.js';
import GameStateManager, { GameStates } from './gameState.js';
import behaviorEngine from '../players/behaviorEngine.js';
import { sleep, randomSleep, calculateJoinTiming } from '../utils/timing.js';
import { createPlayerLogger } from '../utils/logger.js';

/**
 * Trivia Bot class
 */
export class TriviaBot {
  constructor(profile, options = {}) {
    this.profile = profile;
    this.options = {
      gameUrl: options.gameUrl || config.game.url,
      headless: options.headless ?? config.browser.headless,
      ...options,
    };

    this.logger = createPlayerLogger(profile.id);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.pageActions = null;
    this.stateManager = null;
    this.isRunning = false;
    this.gameResults = {
      questionsAnswered: 0,
      correctAnswers: 0,
      finalScore: null,
      finalRank: null,
    };
  }

  /**
   * Initialize the browser and page
   */
  async initialize() {
    this.logger.info('Initializing bot');

    this.browser = await chromium.launch({
      headless: this.options.headless,
    });

    this.context = await this.browser.newContext({
      viewport: config.browser.viewport,
      userAgent: config.browser.userAgent,
    });

    this.page = await this.context.newPage();
    this.pageActions = new PageActions(this.page, this.profile);
    this.stateManager = new GameStateManager(this.page, this.profile);

    // Reset behavior engine state for this player
    behaviorEngine.resetPlayer(this.profile);

    this.logger.info('Bot initialized');
  }

  /**
   * Join the game
   * @param {string} gameUrl - Optional game URL override
   */
  async joinGame(gameUrl) {
    const url = gameUrl || this.options.gameUrl;

    // Calculate join timing based on profile
    const joinTiming = calculateJoinTiming(this.profile);

    if (!joinTiming.shouldJoin) {
      this.logger.info(`Player will not join (${joinTiming.reason})`);
      return false;
    }

    if (joinTiming.delay > 0) {
      this.logger.info(`Joining ${joinTiming.reason}, delay: ${joinTiming.delay}ms`);
      await sleep(joinTiming.delay);
    }

    // Navigate to game
    await this.pageActions.navigateToGame(url);

    // Detect initial state
    const state = await this.stateManager.detectState();

    if (state === GameStates.REGISTRATION) {
      // Fill registration form
      await this.pageActions.fillRegistrationForm();
      await randomSleep(500, 1500);

      // Click join
      const joined = await this.pageActions.clickJoin();
      if (!joined) {
        this.logger.error('Failed to join game');
        return false;
      }

      await randomSleep(1000, 2000);
    }

    this.logger.info('Successfully joined game');
    return true;
  }

  /**
   * Wait for the game to start
   * @param {number} timeout - Timeout in ms
   */
  async waitForGameStart(timeout = 300000) {
    this.logger.info('Waiting for game to start');

    try {
      const state = await this.stateManager.waitForState(
        [GameStates.COUNTDOWN, GameStates.QUESTION],
        timeout
      );

      if (state === GameStates.COUNTDOWN) {
        this.logger.info('Countdown started');
        await this.stateManager.waitForState(GameStates.QUESTION, 180000);
      }

      this.logger.info('Game started!');
      return true;
    } catch (error) {
      this.logger.error('Timeout waiting for game start');
      return false;
    }
  }

  /**
   * Handle a single question
   */
  async handleQuestion() {
    const questionText = await this.pageActions.getQuestionText();
    this.logger.info(`Question: ${questionText.substring(0, 50)}...`);

    // Get answer options
    const options = await this.pageActions.getAnswerOptions();
    if (options.length === 0) {
      this.logger.warn('No answer options found');
      return;
    }

    // Use behavior engine to select answer
    const decision = behaviorEngine.selectAnswer(
      this.profile,
      options,
      null, // We don't know the correct answer
      { difficulty: 0.5 }
    );

    this.logger.debug(`Decision: answer ${decision.index + 1}, delay ${decision.delay}ms`);

    // Wait before answering (human-like delay)
    await sleep(decision.delay);

    // Check if we still can answer (not timed out)
    const currentState = await this.stateManager.detectState();
    if (currentState !== GameStates.QUESTION) {
      this.logger.warn('Question timed out before answering');
      return;
    }

    // Click the answer
    await this.pageActions.clickAnswer(decision.index);
    this.gameResults.questionsAnswered++;

    // Wait for result
    await randomSleep(500, 1000);
    const wasCorrect = await this.pageActions.checkAnswerResult();

    if (wasCorrect !== null) {
      behaviorEngine.recordAnswer(this.profile, wasCorrect);
      if (wasCorrect) {
        this.gameResults.correctAnswers++;
        this.logger.info('Answer: CORRECT!');
      } else {
        this.logger.info('Answer: Wrong');
      }
    }
  }

  /**
   * Main game loop
   */
  async playGame() {
    this.isRunning = true;
    this.logger.info('Starting game loop');

    // Start state polling
    const stopPolling = this.stateManager.startPolling(500);

    try {
      while (this.isRunning) {
        const state = this.stateManager.currentState;

        switch (state) {
          case GameStates.QUESTION:
            await this.handleQuestion();
            // Wait for next state
            await this.stateManager.waitForStateChange(30000);
            break;

          case GameStates.ANSWER_REVEAL:
          case GameStates.BETWEEN_QUESTIONS:
            // Wait for next question or game end
            await this.stateManager.waitForState(
              [GameStates.QUESTION, GameStates.GAME_ENDED],
              60000
            );
            break;

          case GameStates.GAME_ENDED:
            this.logger.info('Game ended');
            this.gameResults.finalScore = await this.pageActions.getCurrentScore();
            this.isRunning = false;
            break;

          case GameStates.ERROR:
            this.logger.error('Game error detected');
            this.isRunning = false;
            break;

          case GameStates.WAITING:
          case GameStates.COUNTDOWN:
            // Still waiting for game
            await sleep(1000);
            break;

          default:
            await sleep(500);
        }
      }
    } catch (error) {
      this.logger.error('Error in game loop', { error: error.message });
    } finally {
      stopPolling();
    }

    return this.gameResults;
  }

  /**
   * Run the complete bot flow
   * @param {string} gameUrl - Optional game URL
   */
  async run(gameUrl) {
    try {
      await this.initialize();

      const joined = await this.joinGame(gameUrl);
      if (!joined) {
        return null;
      }

      const gameStarted = await this.waitForGameStart();
      if (!gameStarted) {
        return null;
      }

      const results = await this.playGame();

      this.logger.info('Bot run complete', {
        questionsAnswered: results.questionsAnswered,
        correctAnswers: results.correctAnswers,
        accuracy: results.questionsAnswered > 0
          ? (results.correctAnswers / results.questionsAnswered * 100).toFixed(1) + '%'
          : 'N/A',
      });

      return results;
    } catch (error) {
      this.logger.error('Bot run failed', { error: error.message });
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Stop the bot
   */
  stop() {
    this.isRunning = false;
    this.logger.info('Bot stopped');
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.logger.info('Cleaning up');

    if (this.page) {
      await this.page.close().catch(() => { });
    }
    if (this.context) {
      await this.context.close().catch(() => { });
    }
    if (this.browser) {
      await this.browser.close().catch(() => { });
    }

    this.page = null;
    this.context = null;
    this.browser = null;
  }
}

export default TriviaBot;





