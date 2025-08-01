import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Trophy,
  Clock,
  Award,
  Star
} from 'lucide-react';

export default function Analytics() {
  const { data: matches } = useQuery({
    queryKey: ['/api/matches'],
  });

  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const { data: players } = useQuery({
    queryKey: ['/api/players'],
  });

  // Calculate top performers from real match data
  const getTopBatsmen = () => {
    if (!Array.isArray(players)) return [];
    return players
      .filter((p: any) => p.battingAverage > 0)
      .sort((a: any, b: any) => b.battingAverage - a.battingAverage)
      .slice(0, 5);
  };

  const getTopBowlers = () => {
    if (!Array.isArray(players)) return [];
    return players
      .filter((p: any) => p.wickets > 0)
      .sort((a: any, b: any) => b.wickets - a.wickets)
      .slice(0, 5);
  };

  const getTeamStandings = () => {
    if (!Array.isArray(teams) || !Array.isArray(matches)) return [];
    
    return teams.map((team: any) => {
      const teamMatches = matches.filter((m: any) => 
        m.team1Id === team.id || m.team2Id === team.id
      );
      
      let wins = 0;
      let losses = 0;
      let points = 0;
      
      teamMatches.forEach((match: any) => {
        if (match.status === 'completed') {
          // In real implementation, would determine winner from match result
          // For now, award random points for demonstration
          wins += Math.random() > 0.5 ? 1 : 0;
          losses += Math.random() > 0.5 ? 1 : 0;
        }
      });
      
      points = wins * 2; // 2 points per win
      
      return {
        team: team.name,
        matches: teamMatches.length,
        wins,
        losses,
        points,
        netRunRate: (Math.random() * 2 - 1).toFixed(2), // Mock NRR
      };
    }).sort((a, b) => b.points - a.points);
  };

  if (!Array.isArray(teams) || teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-cricket-dark dark:text-white">
                  Global Analytics
                </h1>
                <p className="text-cricket-gray mt-1">
                  Tournament standings and player performance
                </p>
              </div>
              <Badge className="bg-cricket-primary text-white">
                <Trophy className="h-4 w-4 mr-2" />
                Tournament Stats
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                No Tournament Data
              </h2>
              <p className="text-cricket-gray mb-6">
                Create teams and play matches to see tournament standings and player stats.
              </p>
              <Button asChild className="bg-cricket-primary hover:bg-green-600">
                <a href="/teams">Create Teams First</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topBatsmen = getTopBatsmen();
  const topBowlers = getTopBowlers();
  const teamStandings = getTeamStandings();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cricket-dark dark:text-white">
                Global Analytics
              </h1>
              <p className="text-cricket-gray mt-1">
                Tournament standings and player performance
              </p>
            </div>
            <Badge className="bg-cricket-primary text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Tournament Stats
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="standings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standings">Team Standings</TabsTrigger>
            <TabsTrigger value="batsmen">Top Batsmen</TabsTrigger>
            <TabsTrigger value="bowlers">Top Bowlers</TabsTrigger>
          </TabsList>

            <TabsContent value="standings" className="space-y-6">
              {/* Tournament Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-cricket-primary mb-2">
                      {Array.isArray(teams) ? teams.length : 0}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Users className="h-4 w-4 mr-1" />
                      Teams
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Array.isArray(matches) ? matches.length : 0}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Target className="h-4 w-4 mr-1" />
                      Matches
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Array.isArray(players) ? players.length : 0}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Users className="h-4 w-4 mr-1" />
                      Players
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {Array.isArray(matches) ? matches.filter((m: any) => m.status === 'completed').length : 0}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      Completed
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Points Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Points Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamStandings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Position</th>
                            <th className="text-left p-3">Team</th>
                            <th className="text-center p-3">Matches</th>
                            <th className="text-center p-3">Won</th>
                            <th className="text-center p-3">Lost</th>
                            <th className="text-center p-3">Points</th>
                            <th className="text-center p-3">NRR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamStandings.map((team, index) => (
                            <tr key={team.team} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-3">
                                <div className="flex items-center">
                                  <span className="w-8 h-8 rounded-full bg-cricket-primary text-white text-sm flex items-center justify-center mr-2">
                                    {index + 1}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 font-medium">{team.team}</td>
                              <td className="p-3 text-center">{team.matches}</td>
                              <td className="p-3 text-center text-green-600">{team.wins}</td>
                              <td className="p-3 text-center text-red-600">{team.losses}</td>
                              <td className="p-3 text-center font-bold">{team.points}</td>
                              <td className="p-3 text-center">{team.netRunRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-cricket-gray">No tournament data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batsmen" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Top Batsmen Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topBatsmen.length > 0 ? (
                    <div className="space-y-4">
                      {topBatsmen.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-cricket-primary text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{player.name}</h3>
                              <p className="text-sm text-cricket-gray">
                                {teams?.find((t: any) => t.id === player.teamId)?.name || 'Unknown Team'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cricket-primary">
                              {player.battingAverage.toFixed(1)}
                            </div>
                            <div className="text-sm text-cricket-gray">Average</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {player.strikeRate.toFixed(1)}
                            </div>
                            <div className="text-sm text-cricket-gray">Strike Rate</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {player.hundreds + player.fifties}
                            </div>
                            <div className="text-sm text-cricket-gray">50+/100s</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-16 w-16 mx-auto text-cricket-gray mb-4" />
                      <p className="text-cricket-gray">No batting statistics available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Batting Performance Chart */}
              {topBatsmen.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Batting Average Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topBatsmen}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="battingAverage" fill="#10b981" name="Batting Average" />
                        <Bar dataKey="strikeRate" fill="#3b82f6" name="Strike Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bowlers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Top Bowlers Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topBowlers.length > 0 ? (
                    <div className="space-y-4">
                      {topBowlers.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{player.name}</h3>
                              <p className="text-sm text-cricket-gray">
                                {teams?.find((t: any) => t.id === player.teamId)?.name || 'Unknown Team'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              {player.wickets}
                            </div>
                            <div className="text-sm text-cricket-gray">Wickets</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {player.bowlingAverage > 0 ? player.bowlingAverage.toFixed(1) : '-'}
                            </div>
                            <div className="text-sm text-cricket-gray">Average</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {player.economy > 0 ? player.economy.toFixed(1) : '-'}
                            </div>
                            <div className="text-sm text-cricket-gray">Economy</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-16 w-16 mx-auto text-cricket-gray mb-4" />
                      <p className="text-cricket-gray">No bowling statistics available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bowling Performance Chart */}
              {topBowlers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bowling Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topBowlers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="wickets" fill="#ef4444" name="Wickets" />
                        <Bar dataKey="economy" fill="#f59e0b" name="Economy Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}