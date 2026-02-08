'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { leaguesAPI } from '@/lib/api'

interface Player {
  id: string
  nickname: string
  name: string | null
  team: string | null
  accuracy: number | null
  personality: string | null
}

interface LeagueDetail {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  players: Player[]
}

export default function LeagueDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [league, setLeague] = useState<LeagueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    loadLeague()
  }, [id])

  const loadLeague = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leaguesAPI.getById(id)
      setLeague(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load league'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-slate-600">Invalid league ID.</p>
        <Link href="/leagues" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
          ← Back to Leagues
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">Loading league…</div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">{error || 'League not found.'}</p>
          <Link href="/leagues" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Leagues
          </Link>
        </div>
      </div>
    )
  }

  const players = league.players || []

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                Trivia Bots Admin
              </Link>
              <Link href="/players" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
                Players
              </Link>
              <Link href="/sessions" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
                Sessions
              </Link>
              <Link href="/leagues" className="text-primary-600 font-medium text-sm">
                Leagues
              </Link>
              <Link href="/gpt" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
                GPT
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/leagues"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-600 mb-6"
        >
          ← Back to Leagues
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">{league.name}</h1>
            {league.description && (
              <p className="mt-2 text-slate-600">{league.description}</p>
            )}
            <p className="mt-3 text-sm text-slate-500">
              {players.length} player{players.length !== 1 ? 's' : ''} in this league
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Players</h2>
            {players.length === 0 ? (
              <p className="text-slate-500 text-sm">No players in this league yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Nickname
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Team
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/players?league_id=${league.id}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {player.nickname}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm hidden sm:table-cell">
                          {player.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm hidden md:table-cell">
                          {player.team || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 text-sm tabular-nums">
                          {player.accuracy != null ? `${Number(player.accuracy).toFixed(0)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/players?league_id=${league.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            View in Players
                          </Link>
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
