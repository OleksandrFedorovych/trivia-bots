'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { leaguesAPI } from '@/lib/api'

interface League {
  id: string
  name: string
  description: string
  player_count: number
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadLeagues()
  }, [])

  const loadLeagues = async () => {
    try {
      setLoading(true)
      const data = await leaguesAPI.getAll()
      setLeagues(data)
    } catch (error: any) {
      console.error('Failed to load leagues:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await leaguesAPI.create(formData)
      setShowModal(false)
      setFormData({ name: '', description: '' })
      await loadLeagues()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">Trivia Bots Admin</Link>
              <Link href="/players" className="text-gray-500 hover:text-gray-900">Players</Link>
              <Link href="/sessions" className="text-gray-500 hover:text-gray-900">Sessions</Link>
              <Link href="/leagues" className="text-gray-900 font-medium">Leagues</Link>
              <Link href="/gpt" className="text-gray-500 hover:text-gray-900">GPT Analysis</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leagues</h1>
              <p className="text-gray-600 mt-1">Manage leagues and teams</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              + Create League
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-500 py-8">Loading leagues...</div>
            ) : leagues.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">No leagues found. Create one to get started.</div>
            ) : (
              leagues.map((league) => (
                <div key={league.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{league.name}</h3>
                  <p className="text-gray-600 mb-4">{league.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{league.player_count} players</span>
                    <Link href={`/leagues/${league.id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create League Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create League</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


