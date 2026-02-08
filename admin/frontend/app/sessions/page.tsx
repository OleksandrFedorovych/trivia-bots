'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sessionsAPI } from '@/lib/api'

interface Session {
  id: string
  session_id: string
  game_url: string
  status: string
  start_time: string
  end_time: string
  duration_seconds: number | null
  total_players: number
  completed_players: number
  failed_players: number
  league_name: string
  avg_accuracy: number | null
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [startFrom, setStartFrom] = useState('')
  const [startTo, setStartTo] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const params: { limit: number; search?: string; start_from?: string; start_to?: string } = { limit: 50 }
      if (search.trim()) params.search = search.trim()
      if (startFrom) params.start_from = new Date(startFrom).toISOString()
      if (startTo) params.start_to = new Date(startTo + 'T23:59:59.999Z').toISOString()
      const data = await sessionsAPI.getAll(params)
      setSessions(data)
    } catch (error: any) {
      console.error('Failed to load sessions:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadSessions()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadSessions()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.idle}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">Trivia Bots Admin</Link>
              <Link href="/players" className="text-gray-500 hover:text-gray-900">Players</Link>
              <Link href="/sessions" className="text-gray-900 font-medium">Sessions</Link>
              <Link href="/leagues" className="text-gray-500 hover:text-gray-900">Leagues</Link>
              <Link href="/gpt" className="text-gray-500 hover:text-gray-900">GPT Analysis</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Game Sessions</h1>
              <p className="text-gray-600 mt-1">View game results and analytics</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>

          <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Session ID, league, or game URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="startFrom" className="block text-sm font-medium text-gray-700 mb-1">Start From</label>
              <input
                id="startFrom"
                type="date"
                value={startFrom}
                onChange={(e) => setStartFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="startTo" className="block text-sm font-medium text-gray-700 mb-1">Start To</label>
              <input
                id="startTo"
                type="date"
                value={startTo}
                onChange={(e) => setStartTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filters
            </button>
          </form>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No sessions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">League</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game URL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/sessions/${encodeURIComponent(session.session_id)}`} className="text-primary-600 hover:text-primary-800">
                            {session.session_id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.league_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(session.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.start_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.end_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.duration_seconds != null ? `${Math.round(session.duration_seconds / 60)} min` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.total_players}/{session.completed_players} completed
                          {session.failed_players > 0 && (
                            <span className="text-red-600 ml-1">({session.failed_players} failed)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a href={session.game_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
                            View Game
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


