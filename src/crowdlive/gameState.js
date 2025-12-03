/**
 * Crowd.live Game State Detection
 * 
 * Monitors and detects the current state of the trivia game.
 */

import selectors from '../config/selectors.js';
import { sleep } from '../utils/timing.js';
import { createPlayerLogger } from '../utils/logger.js';

/**
 * Possible game states
 */
export const GameStates = {
  REGISTRATION: 'registration',
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  QUESTION: 'question',
  ANSWER_REVEAL: 'answer_reveal',
  BETWEEN_QUESTIONS: 'between_questions',
  GAME_ENDED: 'game_ended',
  ERROR: 'error',
  UNKNOWN: 'unknown',
};

/**
 * Game State Manager
 */
export class GameStateManager {
  constructor(page, profile) {
    this.page = page;
    this.profile = profile;
    this.logger = createPlayerLogger(profile.id);
    this.currentState = GameStates.UNKNOWN;
    this.previousState = null;
    this.questionNumber = 0;
    this.stateChangeCallbacks = [];
  }

  /**
   * Detect the current game state
   * @returns {Promise<string>} Current game state
   */
  async detectState() {
    try {
      const pageContent = await this.page.content();
      const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());

      // Check for registration form
      const hasRegistrationForm = await this.page.$(selectors.registration.nicknameInput);
      if (hasRegistrationForm) {
        return this.setState(GameStates.REGISTRATION);
      }

      // Check for game ended
      if (pageText.includes('game over') || 
          pageText.includes('final scores') || 
          pageText.includes('final results') ||
          pageText.includes('thanks for playing')) {
        return this.setState(GameStates.GAME_ENDED);
      }

      // Check for waiting room
      if (pageText.includes('will be activated shortly') || 
          pageText.includes('waiting for host') ||
          pageText.includes('game will start')) {
        return this.setState(GameStates.WAITING);
      }

      // Check for countdown
      const countdownMatch = pageText.match(/(\d+:\d{2})|starting in/);
      const hasCountdown = await this.page.$(selectors.gameState.countdown);
      if (hasCountdown || countdownMatch) {
        // Distinguish between pre-game countdown and question timer
        if (pageText.includes('starting') || pageText.includes('get ready')) {
          return this.setState(GameStates.COUNTDOWN);
        }
      }

      // Check for active question
      const hasQuestion = await this.page.$(selectors.question.container);
      const hasOptions = await this.page.$$(selectors.question.optionButton);
      if (hasQuestion && hasOptions.length > 0) {
        // Check if we can still answer (not locked/revealed)
        const isLocked = await this.page.$(selectors.feedback.locked);
        const hasCorrectFeedback = await this.page.$(selectors.feedback.correct);
        const hasIncorrectFeedback = await this.page.$(selectors.feedback.incorrect);
        
        if (isLocked || hasCorrectFeedback || hasIncorrectFeedback) {
          return this.setState(GameStates.ANSWER_REVEAL);
        }
        
        return this.setState(GameStates.QUESTION);
      }

      // Check for between questions state
      if (pageText.includes('next question') || 
          pageText.includes('question coming')) {
        return this.setState(GameStates.BETWEEN_QUESTIONS);
      }

      // Check for error state
      if (pageText.includes('error') || pageText.includes('something went wrong')) {
        return this.setState(GameStates.ERROR);
      }

      return this.setState(GameStates.UNKNOWN);
    } catch (error) {
      this.logger.error('Error detecting game state', { error: error.message });
      return this.setState(GameStates.ERROR);
    }
  }

  /**
   * Set the current state and trigger callbacks
   * @param {string} newState - New game state
   * @returns {string} The new state
   */
  setState(newState) {
    if (newState !== this.currentState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.logger.debug(`State changed: ${this.previousState} -> ${newState}`);
      
      // Track question number
      if (newState === GameStates.QUESTION && this.previousState !== GameStates.QUESTION) {
        this.questionNumber++;
        this.logger.info(`Question ${this.questionNumber} started`);
      }

      // Trigger callbacks
      this.stateChangeCallbacks.forEach(cb => {
        try {
          cb(newState, this.previousState);
        } catch (e) {
          this.logger.error('State change callback error', { error: e.message });
        }
      });
    }
    return this.currentState;
  }

  /**
   * Register a callback for state changes
   * @param {function} callback - Callback function(newState, previousState)
   */
  onStateChange(callback) {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Wait for a specific state
   * @param {string|array} targetStates - State(s) to wait for
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<string>} The reached state
   */
  async waitForState(targetStates, timeout = 30000) {
    const states = Array.isArray(targetStates) ? targetStates : [targetStates];
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentState = await this.detectState();
      
      if (states.includes(currentState)) {
        return currentState;
      }

      // Check for terminal states
      if (currentState === GameStates.GAME_ENDED || currentState === GameStates.ERROR) {
        return currentState;
      }

      await sleep(500);
    }

    throw new Error(`Timeout waiting for state: ${states.join(', ')}`);
  }

  /**
   * Wait for state to change from current
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<string>} The new state
   */
  async waitForStateChange(timeout = 30000) {
    const startState = this.currentState;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentState = await this.detectState();
      
      if (currentState !== startState) {
        return currentState;
      }

      await sleep(500);
    }

    throw new Error(`Timeout waiting for state change from: ${startState}`);
  }

  /**
   * Poll for state changes continuously
   * @param {number} interval - Poll interval in ms
   * @returns {function} Stop function
   */
  startPolling(interval = 1000) {
    let running = true;

    const poll = async () => {
      while (running) {
        try {
          await this.detectState();
        } catch (error) {
          this.logger.error('Polling error', { error: error.message });
        }
        await sleep(interval);
      }
    };

    poll();

    return () => {
      running = false;
    };
  }

  /**
   * Get current state info
   * @returns {object} State information
   */
  getStateInfo() {
    return {
      current: this.currentState,
      previous: this.previousState,
      questionNumber: this.questionNumber,
    };
  }

  /**
   * Reset state for a new game
   */
  reset() {
    this.currentState = GameStates.UNKNOWN;
    this.previousState = null;
    this.questionNumber = 0;
  }
}

export default GameStateManager;





