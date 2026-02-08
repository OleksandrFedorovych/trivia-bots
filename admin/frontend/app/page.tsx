'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sessionsAPI } from '@/lib/api'

interface PlayerResult {
  id: string
  session_id: string
  player_id: string
  questions_answered: number
  correct_answers: number
  accuracy: number | null
  final_score: number | null
  final_rank: number | null
  status: string
  error_message: string | null
  nickname: string
  name: string | null
  team: string | null
  game_url?: string
}

export default function Home() {
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      setLoading(true)
      const data = await sessionsAPI.getPlayerResults(30)
      setResults(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Failed to load player results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Trivia Bots Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/players" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Players
              </Link>
              <Link href="/sessions" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sessions
              </Link>
              <Link href="/leagues" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Leagues
              </Link>
              <Link href="/gpt" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                GPT Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Player Results</h2>
            <p className="text-gray-600">Latest game performance from player_results table</p>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No player results yet. Run bots to see data.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Q&A</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correct</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/sessions/${r.session_id}`} className="text-blue-600 hover:underline">
                            {r.session_id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.nickname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.team || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.questions_answered}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.correct_answers}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {r.accuracy != null ? `${r.accuracy.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.final_score ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.final_rank ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'completed' ? 'bg-green-100 text-green-800' : r.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && results.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Showing {results.length} recent results</span>
                <button onClick={loadResults} className="text-sm text-blue-600 hover:underline">Refresh</button>
              </div>
            )}
          </div>

          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Link href="/players" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Players</h3>
                  <p className="text-gray-600">Manage TYSN Universe master spreadsheet</p>
                </Link>

                <Link href="/sessions" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Sessions</h3>
                  <p className="text-gray-600">View game results and analytics</p>
                </Link>

                <Link href="/leagues" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Leagues</h3>
                  <p className="text-gray-600">Manage leagues and teams</p>
                </Link>

                <Link href="/gpt" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">GPT Analysis</h3>
                  <p className="text-gray-600">Generate game analysis and scripts</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


