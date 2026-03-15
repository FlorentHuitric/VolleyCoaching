'use client';

import { usePlayersByTeam } from '@/hooks/usePlayersAPI';

/**
 * Test Page for Apollo Client Integration
 * Fetches players from GraphQL API and displays them
 */
export default function TestAPIPage() {
  const { players, loading, error } = usePlayersByTeam();

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🏐 Testing API Connection</h1>
        <p>Loading players from GraphQL API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-500">❌ API Error</h1>
        <pre className="bg-red-50 p-4 rounded text-sm">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">✅ API Connection Successful</h1>
      <p className="mb-4 text-gray-600">Found {players.length} players from database</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player: any) => (
          <div key={player.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              {player.avatar && (
                <img src={player.avatar} alt={`${player.firstName} ${player.lastName}`} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <h3 className="font-bold">
                  #{player.jerseyNumber} {player.firstName} {player.lastName}
                </h3>
                <p className="text-sm text-gray-600">{player.primaryPosition}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Nationality: {player.nationality}</p>
              <p>Status: {player.status}</p>
              <p>Contract: {player.contractLevel}</p>
              {player.height && <p>Height: {player.height}cm</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
