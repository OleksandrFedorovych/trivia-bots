/**
 * Crowd.live Page Actions
 * 
 * Low-level page interactions for the Crowd.live trivia platform.
 */

import selectors from '../config/selectors.js';
import { sleep, randomSleep } from '../utils/timing.js';
import { createPlayerLogger } from '../utils/logger.js';

/**
 * Page Actions class for interacting with Crowd.live
 */
export class PageActions {
  constructor(page, profile) {
    this.page = page;
    this.profile = profile;
    this.logger = createPlayerLogger(profile.id);
  }

  /**
   * Navigate to the game URL
   * @param {string} gameUrl - Game URL to navigate to
   */
  async navigateToGame(gameUrl) {
    this.logger.info(`Navigating to game: ${gameUrl}`);
    await this.page.goto(gameUrl, { waitUntil: 'networkidle' });
    await randomSleep(1000, 2000);
  }

  /**
   * Fill the registration form
   */
  async fillRegistrationForm() {
    this.logger.info('Filling registration form');
    const { registration } = selectors;

    // Wait for form to be ready
    await this.page.waitForSelector(registration.nicknameInput, { timeout: 10000 });

    // Fill nickname (required)
    this.logger.debug('Filling nickname');
    await this.fillField(registration.nicknameInput, this.profile.nickname);
    await randomSleep(300, 800);

    // Fill email if field exists
    this.logger.debug('Filling email');
    await this.fillField(registration.emailInput, this.profile.email);
    await randomSleep(300, 800);

    // Fill name if field exists
    if (this.profile.name) {
      this.logger.debug('Filling name');
      await this.fillField(registration.nameInput, this.profile.name);
      await randomSleep(300, 800);
    }

    // Fill phone if field exists
    if (this.profile.phone) {
      this.logger.debug('Filling phone');
      await this.fillField(registration.phoneInput, this.profile.phone);
      await randomSleep(300, 800);
    }

    this.logger.info('Registration form filled');
  }

  /**
   * Fill a form field with error handling
   * @param {string} selector - Field selector
   * @param {string} value - Value to fill
   */
  async fillField(selector, value) {
    try {
      const field = await this.page.$(selector);
      if (field) {
        await field.click();
        await sleep(100);
        await field.fill('');
        await field.type(value, { delay: 50 + Math.random() * 50 });
        return true;
      }
    } catch (e) {
      this.logger.debug(`Field not found or not fillable: ${selector}`);
    }
    return false;
  }

  /**
   * Click the join button
   */
  async clickJoin() {
    this.logger.info('Clicking join button');

    try {
      // Try multiple approaches to find and click the join button
      const joinSelectors = [
        'button:has-text("Join")',
        'text=Join',
        'button:has-text("JOIN")',
        '[role="button"]:has-text("Join")',
        'div:has-text("Join"):not(:has(*))',  // Leaf element with Join text
      ];

      for (const selector of joinSelectors) {
        try {
          const button = await this.page.locator(selector).first();
          if (await button.isVisible()) {
            await randomSleep(200, 500);
            await button.click();
            this.logger.info(`Join button clicked using: ${selector}`);
            return true;
          }
        } catch (e) {
          this.logger.debug(`Selector failed: ${selector}`);
          continue;
        }
      }

      // Fallback: Try clicking by coordinates if button is visible
      this.logger.warn('Trying coordinate-based click for Join button');
      const joinText = await this.page.locator('text=Join').first();
      if (joinText) {
        const box = await joinText.boundingBox();
        if (box) {
          await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          this.logger.info('Join button clicked via coordinates');
          return true;
        }
      }

      this.logger.warn('Could not find join button');
      return false;
    } catch (error) {
      this.logger.error('Failed to click join button', { error: error.message });
      return false;
    }
  }

  /**
   * Type text with human-like delays
   * @param {string} selector - Input selector
   * @param {string} text - Text to type
   */
  async typeWithHumanDelay(selector, text) {
    const element = await this.page.$(selector);
    if (!element) {
      this.logger.warn(`Element not found: ${selector}`);
      return;
    }

    await element.click();
    await sleep(100);

    // Clear existing content
    await element.fill('');

    // Type with delays
    for (const char of text) {
      await element.type(char, { delay: 50 + Math.random() * 100 });
    }
  }

  /**
   * Get all answer options on the current question
   * @returns {Promise<array>} Array of { element, text, index }
   */
  async getAnswerOptions() {
    const { question } = selectors;

    try {
      // Wait for options to be visible
      await this.page.waitForSelector(question.optionButton, { timeout: 5000 });

      const options = await this.page.$$eval(question.optionButton, (buttons) => {
        return buttons.map((btn, index) => ({
          text: btn.textContent?.trim() || '',
          index,
        }));
      });

      this.logger.debug(`Found ${options.length} answer options`);
      return options;
    } catch (error) {
      this.logger.warn('Could not get answer options', { error: error.message });
      return [];
    }
  }

  /**
   * Click an answer option by index
   * @param {number} index - Option index (0-based)
   */
  async clickAnswer(index) {
    const { question } = selectors;

    try {
      const buttons = await this.page.$$(question.optionButton);

      if (index < 0 || index >= buttons.length) {
        this.logger.warn(`Invalid answer index: ${index}`);
        return false;
      }

      await buttons[index].click();
      this.logger.info(`Clicked answer option ${index + 1}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to click answer', { error: error.message });
      return false;
    }
  }

  /**
   * Get the current question text
   * @returns {Promise<string>} Question text
   */
  async getQuestionText() {
    const { question } = selectors;

    try {
      await this.page.waitForSelector(question.text, { timeout: 5000 });
      const text = await this.page.$eval(question.text, el => el.textContent?.trim() || '');
      return text;
    } catch (error) {
      this.logger.warn('Could not get question text');
      return '';
    }
  }

  /**
   * Get remaining time from timer
   * @returns {Promise<number|null>} Seconds remaining or null
   */
  async getTimeRemaining() {
    const { timer } = selectors;

    try {
      const timerEl = await this.page.$(timer.countdown);
      if (!timerEl) return null;

      const text = await timerEl.textContent();

      // Parse time formats like "0:15" or "15"
      const match = text?.match(/(\d+):?(\d+)?/);
      if (match) {
        if (match[2]) {
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return parseInt(match[1]);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if answer was correct
   * @returns {Promise<boolean|null>} true=correct, false=wrong, null=unknown
   */
  async checkAnswerResult() {
    const { feedback } = selectors;

    try {
      // Small delay for feedback to appear
      await sleep(500);

      const correct = await this.page.$(feedback.correct);
      if (correct) return true;

      const incorrect = await this.page.$(feedback.incorrect);
      if (incorrect) return false;

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current score
   * @returns {Promise<number|null>} Current score or null
   */
  async getCurrentScore() {
    const { score } = selectors;

    try {
      const scoreEl = await this.page.$(score.currentScore);
      if (!scoreEl) return null;

      const text = await scoreEl.textContent();
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Take a screenshot for debugging
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    const timestamp = Date.now();
    const filename = `screenshots/${this.profile.id}-${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename });
    this.logger.debug(`Screenshot saved: ${filename}`);
  }
}

export default PageActions;




