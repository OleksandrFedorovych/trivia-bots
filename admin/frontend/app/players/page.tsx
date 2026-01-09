'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { playersAPI } from '@/lib/api'

interface Player {
  id: string
  nickname: string
  name: string
  email: string
  phone: string
  accuracy: number
  personality: string
  team: string
  active: boolean
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadPlayers()
    loadStats()
  }, [])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const data = await playersAPI.getAll({ active: true })
      setPlayers(data)
    } catch (error: any) {
      console.error('Failed to load players:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await playersAPI.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSync = async () => {
    if (!confirm('Sync players from Excel file to database?')) return

    try {
      setSyncing(true)
      const result = await playersAPI.sync(false)
      alert(`Sync complete! Created: ${result.created}, Updated: ${result.updated}, Total: ${result.total}`)
      await loadPlayers()
      await loadStats()
    } catch (error: any) {
      alert(`Sync failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">Trivia Bots Admin</Link>
              <Link href="/players" className="text-gray-900 font-medium">Players</Link>
              <Link href="/sessions" className="text-gray-500 hover:text-gray-900">Sessions</Link>
              <Link href="/leagues" className="text-gray-500 hover:text-gray-900">Leagues</Link>
              <Link href="/gpt" className="text-gray-500 hover:text-gray-900">GPT Analysis</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Players</h1>
              <p className="text-gray-600 mt-1">Manage TYSN Universe master spreadsheet</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? 'Syncing...' : '🔄 Sync from Excel'}
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Players</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total_players}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Active Players</div>
                <div className="text-2xl font-bold text-gray-900">{stats.active_players}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Teams</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total_teams}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Avg Accuracy</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.avg_accuracy ? `${parseFloat(stats.avg_accuracy).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Players Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading players...</div>
            ) : players.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No players found. Click &quot;Sync from Excel&quot; to load players from the TYSN Universe spreadsheet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nickname</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personality</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.nickname}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {player.accuracy != null ? `${Number(player.accuracy).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.personality || '-'}</td>
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


