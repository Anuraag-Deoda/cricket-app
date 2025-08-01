import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Target, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration - would come from actual match results
  const leaderboardData = teams?.map((team: any, index: number) => ({
    ...team,
    position: index + 1,
    matchesPlayed: Math.floor(Math.random() * 10) + 5,
    matchesWon: Math.floor(Math.random() * 8) + 2,
    matchesLost: Math.floor(Math.random() * 5) + 1,
    netRunRate: (Math.random() * 2 - 1).toFixed(2),
    points: Math.floor(Math.random() * 16) + 8
  })).sort((a: any, b: any) => b.points - a.points) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">Team Rankings</h1>
              <p className="text-cricket-gray">Current standings and team performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!teams || teams.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                No rankings available
              </h2>
              <p className="text-cricket-gray mb-8">
                Create teams and play matches to see rankings and statistics.
              </p>
              <Link href="/teams">
                <Button size="lg" className="bg-cricket-primary hover:bg-green-600">
                  Create Teams
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Options */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="border-cricket-primary text-cricket-primary">
                    All Formats
                  </Button>
                  <Button variant="outline">T20</Button>
                  <Button variant="outline">ODI</Button>
                  <Button variant="outline">Test</Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-cricket-primary" />
                  Team Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-semibold">Pos</th>
                        <th className="pb-3 font-semibold">Team</th>
                        <th className="pb-3 font-semibold text-center">Played</th>
                        <th className="pb-3 font-semibold text-center">Won</th>
                        <th className="pb-3 font-semibold text-center">Lost</th>
                        <th className="pb-3 font-semibold text-center">NRR</th>
                        <th className="pb-3 font-semibold text-center">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((team: any, index: number) => (
                        <tr key={team.id} className="border-b hover:bg-cricket-bg/50">
                          <td className="py-4">
                            <div className="flex items-center">
                              <span className="font-bold text-lg">{index + 1}</span>
                              {index === 0 && <Trophy className="h-4 w-4 ml-1 text-yellow-500" />}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-cricket-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {team.name.split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold">{team.name}</div>
                                <div className="text-sm text-cricket-gray">{team.homeGround}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">{team.matchesPlayed}</td>
                          <td className="py-4 text-center text-cricket-primary font-semibold">
                            {team.matchesWon}
                          </td>
                          <td className="py-4 text-center">{team.matchesLost}</td>
                          <td className="py-4 text-center">
                            <span className={`font-semibold ${
                              parseFloat(team.netRunRate) >= 0 
                                ? 'text-cricket-primary' 
                                : 'text-red-500'
                            }`}>
                              {team.netRunRate > 0 ? '+' : ''}{team.netRunRate}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="font-bold text-lg">{team.points}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-cricket-primary" />
                  </div>
                  <div className="text-2xl font-bold text-cricket-dark dark:text-white">
                    {leaderboardData[0]?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-cricket-gray">Top Team</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-cricket-primary" />
                  </div>
                  <div className="text-2xl font-bold text-cricket-dark dark:text-white">
                    {Math.max(...leaderboardData.map((team: any) => parseFloat(team.netRunRate)))}
                  </div>
                  <div className="text-sm text-cricket-gray">Best NRR</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-cricket-primary" />
                  </div>
                  <div className="text-2xl font-bold text-cricket-dark dark:text-white">
                    {leaderboardData.reduce((sum: number, team: any) => sum + team.matchesPlayed, 0)}
                  </div>
                  <div className="text-sm text-cricket-gray">Total Matches</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}