import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ElectionResult {
  position: number;
  candidateId: string;
  candidateAddress?: string;
  name?: string;
  party?: string;
  votesReceived: number;
  percentage: number;
}

interface ElectionResultsData {
  election: {
    _id: string;
    title: string;
    description: string;
    electionType: string;
    contractAddress: string;
    status: string;
    resultsAnnouncedAt: string;
    totalRegisteredVoters: number;
    totalVotesCast: number;
    turnoutPercentage: number;
  };
  winner: {
    votesReceived: number;
    walletAddress: string;
  };
  results: ElectionResult[];
  detailedResults: ElectionResult[];
}

interface ElectionResultsProps {
  contractAddress: string;
  onClose?: () => void;
}

export function ElectionResults({ contractAddress, onClose }: ElectionResultsProps) {
  const [resultsData, setResultsData] = useState<ElectionResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [contractAddress]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/election/${contractAddress}/results`);
      setResultsData(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button 
          onClick={fetchResults}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!resultsData) {
    return <div className="text-center p-8">No results available</div>;
  }

  const { election, winner, detailedResults } = resultsData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{election.title}</h2>
          <p className="text-gray-600 capitalize">{election.electionType} Election Results</p>
          <p className="text-sm text-gray-500">
            Results announced: {new Date(election.resultsAnnouncedAt).toLocaleDateString()}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Election Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{election.totalRegisteredVoters}</div>
          <div className="text-sm text-gray-600">Registered Voters</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{election.totalVotesCast}</div>
          <div className="text-sm text-gray-600">Votes Cast</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{election.turnoutPercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Turnout</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{winner.votesReceived}</div>
          <div className="text-sm text-gray-600">Winning Votes</div>
        </div>
      </div>

      {/* Winner Announcement */}
      {detailedResults.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏆</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Winner</h3>
              <p className="text-lg font-semibold text-gray-900">
                {detailedResults[0].name || `Candidate ${detailedResults[0].candidateId}`}
                {detailedResults[0].party && (
                  <span className="ml-2 text-sm text-gray-700">({detailedResults[0].party})</span>
                )}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {detailedResults[0].votesReceived} votes ({detailedResults[0].percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Position</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Candidate</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Party</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Votes</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {detailedResults.map((result, index) => (
              <tr 
                key={result.candidateId} 
                className={`${index === 0 ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <td className="border border-gray-300 px-4 py-3">
                  <div className="flex items-center">
                    {index === 0 && <span className="mr-2">🥇</span>}
                    {index === 1 && <span className="mr-2">🥈</span>}
                    {index === 2 && <span className="mr-2">🥉</span>}
                    <span className="font-medium text-gray-800">#{result.position}</span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="font-semibold text-gray-900">
                    {result.name || `Candidate ${result.candidateId}`}
                  </div>
                  {result.candidateAddress && (
                    <div className="text-xs text-gray-600 font-mono mt-1">
                      {result.candidateAddress.slice(0, 6)}...{result.candidateAddress.slice(-4)}
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-gray-800">
                  {result.party || '-'}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <span className="font-bold text-gray-900 text-lg">{result.votesReceived}</span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-3 mr-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="font-semibold ml-2 text-gray-900">{result.percentage.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-sm">
        <p className="text-gray-700 font-medium">Election Contract: 
          <span className="font-mono ml-1 text-gray-900">{election.contractAddress}</span>
        </p>
        <p className="text-gray-700 font-medium mt-1">Status: 
          <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase">
            {election.status.replace('_', ' ')}
          </span>
        </p>
      </div>
    </div>
  );
}