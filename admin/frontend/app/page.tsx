import Link from 'next/link'

export default function Home() {
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
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Trivia Bots Admin</h2>
              <p className="text-lg text-gray-600 mb-8">
                Manage your TYSN Universe players, analyze game results, and generate GPT-powered content
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
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


