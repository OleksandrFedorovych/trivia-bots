/**
 * API Client
 * Helper functions for API calls
 * - NEXT_PUBLIC_API_URL: used by Next.js frontend (browser)
 * - ADMIN_API_URL: used by Node.js (runMultipleBots, etc.)
 */

const API_BASE =
  process.env.ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:3001/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let error: { error?: string } = {};
    try {
      error = text ? JSON.parse(text) : { error: response.statusText };
    } catch {
      error = { error: text || response.statusText };
    }
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Players API
export const playersAPI = {
  getAll: (params?: { league_id?: string; active?: boolean; team?: string }) => {
    const query = new URLSearchParams();
    if (params?.league_id) query.append('league_id', params.league_id);
    if (params?.active !== undefined) query.append('active', String(params.active));
    if (params?.team) query.append('team', params.team);
    return fetchAPI(`/players?${query.toString()}`);
  },
  getById: (id: string) => fetchAPI(`/players/${id}`),
  sync: (dryRun = false) => fetchAPI('/players/sync', {
    method: 'POST',
    body: JSON.stringify({ dryRun }),
  }),
  update: (id: string, data: any) => fetchAPI(`/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string, hardDelete = false) => fetchAPI(`/players/${id}?hardDelete=${hardDelete}`, {
    method: 'DELETE',
  }),
  getStats: () => fetchAPI('/players/stats/summary'),
};

// Player Results API (player_results table)
export const playerResultsAPI = {
  addResult: (data: any) => fetchAPI('/player-results', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Sessions API
export const sessionsAPI = {
  getAll: (params?: { status?: string; league_id?: string; limit?: number; offset?: number; search?: string; start_from?: string; start_to?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.league_id) query.append('league_id', params.league_id);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));
    if (params?.search) query.append('search', params.search);
    if (params?.start_from) query.append('start_from', params.start_from);
    if (params?.start_to) query.append('start_to', params.start_to);
    return fetchAPI(`/sessions?${query.toString()}`);
  },
  getById: (id: string) => fetchAPI(`/sessions/${id}`),
  getByIdOptional: async (id: string) => {
    try {
      return await fetchAPI(`/sessions/${id}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Session not found')) return null;
      throw err;
    }
  },
  create: (data: any) => fetchAPI('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  addResult: (data: any) => fetchAPI(`/sessions}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  /** Get player_results from player_results table */
  getPlayerResults: (limit = 50) => fetchAPI(`/player-results?limit=${limit}`),
};

// Leagues API
export const leaguesAPI = {
  getAll: () => fetchAPI('/leagues'),
  getById: (id: string) => fetchAPI(`/leagues/${id}`),
  create: (data: any) => fetchAPI('/leagues', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/leagues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/leagues/${id}`, {
    method: 'DELETE',
  }),
};

// GPT API
export const gptAPI = {
  analyzeGame: (sessionId: string) => fetchAPI(`/gpt/analyze-game/${sessionId}`, {
    method: 'POST',
  }),
  analyzeWeekly: (sessionIds: string[], leagueId?: string) => fetchAPI('/gpt/analyze-weekly', {
    method: 'POST',
    body: JSON.stringify({ session_ids: sessionIds, league_id: leagueId }),
  }),
  generateSponsorScript: (sessionId: string, sponsorName?: string) => fetchAPI(`/gpt/sponsor-script/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify({ sponsor_name: sponsorName }),
  }),
  getContent: (sessionId: string, contentType?: string) => {
    const query = contentType ? `?content_type=${contentType}` : '';
    return fetchAPI(`/gpt/content/${sessionId}${query}`);
  },
  getRecent: (limit = 20, contentType?: string) => {
    const query = new URLSearchParams();
    query.append('limit', String(limit));
    if (contentType) query.append('content_type', contentType);
    return fetchAPI(`/gpt/recent?${query.toString()}`);
  },
};


