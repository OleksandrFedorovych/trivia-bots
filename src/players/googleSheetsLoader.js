/**
 * Google Sheets Loader
 * 
 * Loads player profiles and game data from Google Sheets.
 */

import { google } from 'googleapis';
import config from '../config/default.js';
import { parseFromSheetRow, createProfile } from './playerSchema.js';
import logger from '../utils/logger.js';

/**
 * Google Sheets client wrapper
 */
export class GoogleSheetsLoader {
  constructor(options = {}) {
    this.spreadsheetId = options.spreadsheetId || config.googleSheets.spreadsheetId;
    this.credentials = options.credentials || config.googleSheets.credentials;
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Initialize the Google Sheets API client
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: this.credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const authClient = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      this.initialized = true;
      logger.info('Google Sheets API initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Sheets API', { error: error.message });
      throw error;
    }
  }

  /**
   * Get values from a sheet range
   * @param {string} range - Sheet range (e.g., 'Players!A2:Z')
   * @returns {Promise<array>} Row data
   */
  async getValues(range) {
    await this.initialize();

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      logger.error(`Failed to get values from range: ${range}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Load player profiles from the Players sheet
   * @param {object} options - Load options
   * @returns {Promise<array>} Array of player profiles
   */
  async loadPlayers(options = {}) {
    const { limit, filter } = options;

    try {
      // Get headers first
      const headersRange = 'Players!A1:Z1';
      const headersResult = await this.getValues(headersRange);
      const headers = headersResult[0] || [];

      // Normalize headers (lowercase, remove spaces)
      const normalizedHeaders = headers.map(h => 
        h.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
      );

      // Map common variations to standard field names
      const headerMap = {
        'id': 'id',
        'playerid': 'id',
        'nickname': 'nickname',
        'nick': 'nickname',
        'name': 'name',
        'fullname': 'name',
        'email': 'email',
        'emailaddress': 'email',
        'phone': 'phone',
        'phonenumber': 'phone',
        'city': 'city',
        'club': 'club',
        'team': 'club',
        'accuracy': 'accuracy',
        'accuracyrate': 'accuracy',
        'personality': 'personality',
        'reactiontime': 'reactionTime',
        'backstory': 'backstory',
        'background': 'backstory',
      };

      const mappedHeaders = normalizedHeaders.map(h => headerMap[h] || h);

      // Get player data
      const dataRange = config.googleSheets.ranges.players;
      const rows = await this.getValues(dataRange);

      // Parse rows into profiles
      let profiles = rows.map(row => parseFromSheetRow(row, mappedHeaders));

      // Apply filter if provided
      if (filter) {
        profiles = profiles.filter(filter);
      }

      // Apply limit if provided
      if (limit && limit > 0) {
        profiles = profiles.slice(0, limit);
      }

      logger.info(`Loaded ${profiles.length} player profiles from Google Sheets`);
      return profiles;
    } catch (error) {
      logger.error('Failed to load players from Google Sheets', { error: error.message });
      throw error;
    }
  }

  /**
   * Load cities from the Cities sheet
   * @returns {Promise<array>} Array of city objects
   */
  async loadCities() {
    try {
      const range = config.googleSheets.ranges.cities;
      const rows = await this.getValues(range);
      
      // Assume format: City Name, State/Province, Country
      const cities = rows.map(row => ({
        name: row[0],
        state: row[1],
        country: row[2],
        clubs: [],
      }));

      logger.info(`Loaded ${cities.length} cities from Google Sheets`);
      return cities;
    } catch (error) {
      logger.error('Failed to load cities', { error: error.message });
      return [];
    }
  }

  /**
   * Load clubs from the Clubs sheet
   * @returns {Promise<array>} Array of club objects
   */
  async loadClubs() {
    try {
      const range = config.googleSheets.ranges.clubs;
      const rows = await this.getValues(range);
      
      // Assume format: Club Name, City, Sport, Description
      const clubs = rows.map(row => ({
        name: row[0],
        city: row[1],
        sport: row[2],
        description: row[3],
      }));

      logger.info(`Loaded ${clubs.length} clubs from Google Sheets`);
      return clubs;
    } catch (error) {
      logger.error('Failed to load clubs', { error: error.message });
      return [];
    }
  }
}

/**
 * Load players from a local JSON file (fallback/testing)
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<array>} Array of player profiles
 */
export async function loadPlayersFromFile(filePath) {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile(filePath, 'utf-8');
    const players = JSON.parse(data);
    return players.map(p => createProfile(p));
  } catch (error) {
    logger.error('Failed to load players from file', { error: error.message });
    throw error;
  }
}

/**
 * Create test players for development
 * @param {number} count - Number of test players to create
 * @returns {array} Array of player profiles
 */
export function createTestPlayers(count = 10) {
  const players = [];
  const personalities = ['fast', 'cautious', 'random', 'normal'];
  const cities = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'];
  
  for (let i = 1; i <= count; i++) {
    players.push(createProfile({
      id: `test-player-${i}`,
      nickname: `TestPlayer${i}`,
      name: `Test Player ${i}`,
      email: `testplayer${i}@example.com`,
      phone: `+1555000${String(i).padStart(4, '0')}`,
      city: cities[i % cities.length],
      club: `Test Club ${Math.ceil(i / 2)}`,
      accuracy: 0.5 + Math.random() * 0.4, // 50-90%
      personality: personalities[i % personalities.length],
      reactionTime: {
        min: 1500 + Math.random() * 1000,
        max: 8000 + Math.random() * 4000,
        average: 4000 + Math.random() * 2000,
      },
      lateJoinChance: Math.random() * 0.2,
      noShowChance: Math.random() * 0.05,
    }));
  }
  
  logger.info(`Created ${count} test players`);
  return players;
}

// Export singleton instance
export const sheetsLoader = new GoogleSheetsLoader();

export default sheetsLoader;





