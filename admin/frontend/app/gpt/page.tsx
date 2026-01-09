'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { gptAPI, sessionsAPI } from '@/lib/api'

interface Session {
  id: string
  session_id: string
  game_url: string
  start_time: string
  league_name: string
}

export default function GPTPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState<'game' | 'weekly'>('game')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await sessionsAPI.getAll({ limit: 20, status: 'completed' })
      setSessions(data)
    } catch (error: any) {
      console.error('Failed to load sessions:', error)
    }
  }

  const handleAnalyzeGame = async () => {
    if (!selectedSession) {
      alert('Please select a session')
      return
    }

    try {
      setLoading(true)
      setAnalysis('')
      const result = await gptAPI.analyzeGame(selectedSession)
      setAnalysis(result.analysis)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeWeekly = async () => {
    if (!selectedSession) {
      alert('Please select a session')
      return
    }

    // For weekly, we'd need multiple session IDs
    // This is a simplified version - you'd want a multi-select UI
    alert('Weekly analysis requires multiple sessions. This feature is coming soon!')
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
              <Link href="/leagues" className="text-gray-500 hover:text-gray-900">Leagues</Link>
              <Link href="/gpt" className="text-gray-900 font-medium">GPT Analysis</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">GPT Analysis</h1>
            <p className="text-gray-600 mt-1">Generate game-to-game and week-to-week analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Analysis</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as 'game' | 'weekly')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="game">Game-to-Game Analysis</option>
                  <option value="weekly">Week-to-Week Analysis</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Select a session --</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.session_id} - {session.league_name || 'No league'} ({new Date(session.start_time).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={analysisType === 'game' ? handleAnalyzeGame : handleAnalyzeWeekly}
                disabled={loading || !selectedSession}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : `Generate ${analysisType === 'game' ? 'Game' : 'Weekly'} Analysis`}
              </button>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> GPT analysis requires an OpenAI API key to be configured in your environment variables.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
              {analysis ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border">
                    {analysis}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a session and click &quot;Generate Analysis&quot; to see results here
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


