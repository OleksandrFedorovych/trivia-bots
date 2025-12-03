/**
 * Crowd.live DOM Selectors
 * 
 * These selectors are used to interact with the Crowd.live trivia platform.
 * Update these if the platform's HTML structure changes.
 */

export const selectors = {
  // Registration Form - Updated for Crowd.live
  registration: {
    nicknameInput: 'input[placeholder*="Nickname"]',
    nameInput: 'input[placeholder*="Name"]:not([placeholder*="Nickname"])',
    emailInput: 'input[placeholder*="Email"]',
    phoneInput: 'input[type="tel"]',
    countryCodeDropdown: '.flag-dropdown, .selected-flag, [class*="flag"]',
    joinButton: 'button >> text=Join',  // Playwright text selector
    joinButtonAlt: 'text=Join',         // Alternative selector
  },

  // Game States
  gameState: {
    waitingRoom: 'text=/will be activated shortly/i, text=/waiting/i, text=/game will start/i',
    countdown: 'text=/\\d{1,2}:\\d{2}/, .countdown, .timer, [class*="countdown"]',
    questionActive: '.question-container, .question, [class*="question"]',
    gameEnded: 'text=/game over/i, text=/final scores/i, text=/leaderboard/i',
  },

  // Question & Answers
  question: {
    container: '.question-container, .question, [class*="question-text"]',
    text: '.question-text, .question h1, .question h2, [class*="question"] p',
    optionsContainer: '.answers, .options, [class*="answer"], [class*="option"]',
    optionButton: '.answer-button, .option, button[class*="answer"], [class*="choice"]',
    optionText: '.answer-text, .option-text, span, p',
  },

  // Timer & Progress
  timer: {
    countdown: '.timer, .countdown, [class*="timer"], [class*="countdown"]',
    progressBar: '.progress, .progress-bar, [class*="progress"]',
    timeText: '.time-remaining, .timer-text, [class*="time"]',
  },

  // Answer Feedback
  feedback: {
    correct: '.correct, [class*="correct"], [class*="right"], .green',
    incorrect: '.incorrect, .wrong, [class*="incorrect"], [class*="wrong"], .red',
    selected: '.selected, [class*="selected"], .active',
    locked: '.locked, [class*="locked"], .disabled',
  },

  // Score & Leaderboard
  score: {
    currentScore: '.score, .points, [class*="score"], [class*="points"]',
    rank: '.rank, .position, [class*="rank"]',
    leaderboard: '.leaderboard, [class*="leaderboard"], .standings',
  },

  // General UI
  ui: {
    loadingSpinner: '.loading, .spinner, [class*="loading"]',
    errorMessage: '.error, [class*="error"], .alert-danger',
    modal: '.modal, [class*="modal"], .popup',
  },
};

export default selectors;




