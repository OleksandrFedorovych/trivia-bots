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
  total_players: number
  completed_players: number
  failed_players: number
  league_name: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await sessionsAPI.getAll({ limit: 50 })
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game URL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/sessions/${session.id}`} className="text-primary-600 hover:text-primary-800">
                            {session.session_id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.league_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(session.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(session.start_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.completed_players}/{session.total_players} completed
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


