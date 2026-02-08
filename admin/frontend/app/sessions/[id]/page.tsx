'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { sessionsAPI } from '@/lib/api'

interface PlayerResult {
  id: string
  nickname: string
  name: string | null
  team: string | null
  questions_answered: number
  correct_answers: number
  accuracy: number | null
  final_score: number | null
  final_rank: number | null
  status: string
}

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
  player_results: PlayerResult[]
}

export default function SessionDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadSession()
  }, [id])

  const loadSession = async () => {
    try {
      setLoading(true)
      const data = await sessionsAPI.getById(id)
      setSession(data)
    } catch (error: any) {
      console.error('Failed to load session:', error)
      alert(`Error: ${error.message}`)
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
          <Link href="/sessions" className="text-primary-600 hover:text-primary-800 text-sm mb-4 inline-block">
            ← Back to Sessions
          </Link>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading session...</div>
          ) : !session ? (
            <div className="p-8 text-center text-gray-500">Session not found.</div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Session {session.session_id}</h1>
                <p className="text-gray-600 mt-1">{session.league_name || 'No league'}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <span>{getStatusBadge(session.status)}</span>
                  <span className="text-sm text-gray-600">
                    Start: {formatDate(session.start_time)} | End: {formatDate(session.end_time)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Players: {session.total_players}/{session.completed_players} completed
                    {session.failed_players > 0 && ` (${session.failed_players} failed)`}
                  </span>
                  <a href={session.game_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 text-sm">
                    View Game →
                  </a>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <h2 className="px-6 py-4 text-xl font-semibold text-gray-900 border-b">Player Results</h2>
                {!session.player_results || session.player_results.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No player results yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions Answered</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answers</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Score</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {session.player_results.map((pr) => (
                          <tr key={pr.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{pr.final_rank ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {pr.nickname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pr.team || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pr.questions_answered}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pr.correct_answers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pr.accuracy != null ? `${Number(pr.accuracy).toFixed(1)}%` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {pr.final_score ?? '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
