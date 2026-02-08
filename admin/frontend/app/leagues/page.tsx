'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { leaguesAPI } from '@/lib/api'

interface League {
  id: string
  name: string
  description: string | null
  player_count: string
  created_at?: string
  updated_at?: string
}

type ModalMode = 'create' | 'edit' | 'delete' | null

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingLeague, setDeletingLeague] = useState<League | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeagues()
  }, [])

  const loadLeagues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leaguesAPI.getAll()
      setLeagues(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load leagues'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setFormData({ name: '', description: '' })
    setModalMode('create')
  }

  const openEdit = (league: League) => {
    setFormData({
      name: league.name,
      description: league.description || '',
    })
    setEditingId(league.id)
    setModalMode('edit')
  }

  const openDelete = (league: League) => {
    setDeletingLeague(league)
    setModalMode('delete')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setDeletingLeague(null)
    setFormData({ name: '', description: '' })
    setError(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await leaguesAPI.create(formData)
      closeModal()
      await loadLeagues()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create league'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setSubmitting(true)
    setError(null)
    try {
      await leaguesAPI.update(editingId, formData)
      closeModal()
      await loadLeagues()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update league'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLeague) return
    setSubmitting(true)
    setError(null)
    try {
      await leaguesAPI.delete(deletingLeague.id)
      closeModal()
      await loadLeagues()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete league'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const playerCount = (league: League) => {
    const n = Number(league.player_count)
    return isNaN(n) ? 0 : n
  }

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

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leagues</h1>
            <p className="text-slate-600 mt-0.5 text-sm">Create and manage leagues and teams.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Create League
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            Loading leagues…
          </div>
        ) : leagues.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600 mb-4">No leagues yet.</p>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Create your first league
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">
                      Players
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {leagues.map((league) => (
                    <tr key={league.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/leagues/${league.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {league.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm hidden sm:table-cell max-w-xs truncate">
                        {league.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 text-sm tabular-nums">
                        {playerCount(league)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(league)}
                            className="text-slate-600 hover:text-primary-600 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => openDelete(league)}
                            className="text-slate-600 hover:text-red-600 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {modalMode === 'create' ? 'Create League' : 'Edit League'}
              </h2>
              <form
                onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}
                className="mt-4 space-y-4"
              >
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : modalMode === 'create' ? 'Create' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {modalMode === 'delete' && deletingLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div
            className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">Delete league?</h2>
            <p className="mt-2 text-sm text-slate-600">
              “{deletingLeague.name}” will be permanently removed. Players in this league will not be deleted.
            </p>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
