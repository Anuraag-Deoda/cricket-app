import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Clock,
  Zap,
  Activity,
  Eye
} from 'lucide-react';

interface MatchAnalytics {
  totalRuns: number;
  totalWickets: number;
  overs: number;
  runRate: number;
  overProgression: Array<{
    over: number;
    runs: number;
    wickets: number;
    cumulativeRuns: number;
    cumulativeWickets: number;
  }>;
  ballByBall: Array<{
    over: number;
    ball: number;
    runs: number;
    isWicket: boolean;
    extras: string | null;
    shotType: string | null;
    timestamp: Date;
  }>;
}

export default function MatchAnalytics() {
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['/api/matches', matchId],
    enabled: !!matchId,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/matches', matchId, 'analytics'],
    enabled: !!matchId,
  });

  const { data: team1 } = useQuery({
    queryKey: ['/api/teams', match?.team1Id],
    enabled: !!match?.team1Id,
  });

  const { data: team2 } = useQuery({
    queryKey: ['/api/teams', match?.team2Id],
    enabled: !!match?.team2Id,
  });

  const { data: balls } = useQuery({
    queryKey: ['/api/matches', matchId, 'balls'],
    enabled: !!matchId,
  });

  if (matchLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading match analytics...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Link href="/matches/history">
            <Button>Back to Matches</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasMatchData = balls && Array.isArray(balls) && balls.length > 0;
  const typedAnalytics = analytics as MatchAnalytics;

  // Calculate match phase progression
  const getPhaseData = () => {
    if (!hasMatchData) return [];
    
    const powerplayBalls = balls.slice(0, 36); // First 6 overs
    const middleBalls = balls.slice(36, 90); // 7-15 overs
    const deathBalls = balls.slice(90); // 16+ overs
    
    return [
      {
        phase: 'Powerplay (1-6)',
        runs: powerplayBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0),
        wickets: powerplayBalls.filter((ball: any) => ball.isWicket).length,
        balls: powerplayBalls.length,
        runRate: powerplayBalls.length > 0 ? (powerplayBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0) / powerplayBalls.length) * 6 : 0,
      },
      {
        phase: 'Middle (7-15)',
        runs: middleBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0),
        wickets: middleBalls.filter((ball: any) => ball.isWicket).length,
        balls: middleBalls.length,
        runRate: middleBalls.length > 0 ? (middleBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0) / middleBalls.length) * 6 : 0,
      },
      {
        phase: 'Death (16+)',
        runs: deathBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0),
        wickets: deathBalls.filter((ball: any) => ball.isWicket).length,
        balls: deathBalls.length,
        runRate: deathBalls.length > 0 ? (deathBalls.reduce((sum: number, ball: any) => sum + ball.runs, 0) / deathBalls.length) * 6 : 0,
      },
    ];
  };

  // Calculate boundary analysis
  const getBoundaryData = () => {
    if (!hasMatchData) return [];
    
    const overs = Math.ceil(balls.length / 6);
    const boundaryData = [];
    
    for (let i = 0; i < overs; i++) {
      const overBalls = balls.slice(i * 6, (i + 1) * 6);
      const fours = overBalls.filter((ball: any) => ball.runs === 4).length;
      const sixes = overBalls.filter((ball: any) => ball.runs === 6).length;
      
      boundaryData.push({
        over: i + 1,
        fours,
        sixes,
        total: fours + sixes,
      });
    }
    
    return boundaryData;
  };

  // Calculate partnership data (mock for now since we don't track partnerships yet)
  const getPartnershipData = () => {
    if (!hasMatchData) return [];
    
    // This would be calculated from actual partnership tracking
    // For now, return mock data based on match progression
    const totalRuns = typedAnalytics?.totalRuns || balls.reduce((sum: number, ball: any) => sum + ball.runs, 0);
    const wickets = typedAnalytics?.totalWickets || balls.filter((ball: any) => ball.isWicket).length;
    
    // Mock partnership breakdown
    const partnerships = [];
    let remainingRuns = totalRuns;
    
    for (let i = 0; i < wickets + 1 && remainingRuns > 0; i++) {
      const runs = Math.min(remainingRuns, Math.floor(Math.random() * 50) + 10);
      partnerships.push({
        name: i === 0 ? 'Opening Partnership' : `${i + 1}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Wicket`,
        value: runs,
        color: `hsl(${(i * 60) % 360}, 70%, 50%)`,
      });
      remainingRuns -= runs;
    }
    
    return partnerships;
  };

  const phaseData = getPhaseData();
  const boundaryData = getBoundaryData();
  const partnershipData = getPartnershipData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/matches/history">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Matches
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">
                  Match Analytics
                </h1>
                <p className="text-cricket-gray">
                  {team1?.name || 'Team 1'} vs {team2?.name || 'Team 2'}
                </p>
              </div>
            </div>
            <Badge className="bg-cricket-primary text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Live Analytics
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!hasMatchData ? (
          <Card>
            <CardContent className="text-center py-16">
              <Eye className="h-16 w-16 mx-auto text-cricket-gray mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Match Data</h3>
              <p className="text-cricket-gray mb-6">
                This match hasn't been played yet or has no ball-by-ball data.
              </p>
              <Link href={`/matches/live/${matchId}`}>
                <Button className="bg-cricket-primary hover:bg-green-600">
                  Start Live Scoring
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progression">Run Progression</TabsTrigger>
              <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
              <TabsTrigger value="boundaries">Boundaries</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Match Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-cricket-primary mb-2">
                      {typedAnalytics?.totalRuns || balls.reduce((sum: number, ball: any) => sum + ball.runs, 0)}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Target className="h-4 w-4 mr-1" />
                      Total Runs
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {typedAnalytics?.totalWickets || balls.filter((ball: any) => ball.isWicket).length}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Users className="h-4 w-4 mr-1" />
                      Wickets
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {typedAnalytics?.overs?.toFixed(1) || (Math.floor(balls.length / 6) + (balls.length % 6) / 10).toFixed(1)}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Overs
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {typedAnalytics?.runRate?.toFixed(1) || (balls.length > 0 ? ((balls.reduce((sum: number, ball: any) => sum + ball.runs, 0) / balls.length) * 6).toFixed(1) : '0.0')}
                    </div>
                    <div className="text-sm text-cricket-gray flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Run Rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Match Phase Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Match Phase Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={phaseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="phase" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="runs" fill="#10b981" name="Runs" />
                      <Bar dataKey="wickets" fill="#ef4444" name="Wickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Balls Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Balls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {balls.slice(-20).map((ball: any, index: number) => (
                      <div
                        key={index}
                        className={`
                          min-w-[40px] h-10 rounded-full flex items-center justify-center text-sm font-medium
                          ${ball.isWicket 
                            ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                            : ball.runs === 6 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : ball.runs === 4
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}
                      >
                        {ball.isWicket ? 'W' : ball.runs}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Run Rate Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={typedAnalytics?.overProgression || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="over" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeRuns" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="Cumulative Runs"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="runs" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Runs per Over"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Over-by-Over Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typedAnalytics?.overProgression || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="over" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="runs" fill="#10b981" name="Runs per Over" />
                      <Bar dataKey="wickets" fill="#ef4444" name="Wickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partnerships" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={partnershipData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {partnershipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {partnershipData.map((partnership, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: partnership.color }}
                            ></div>
                            <span className="font-medium">{partnership.name}</span>
                          </div>
                          <Badge variant="secondary">{partnership.value} runs</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="boundaries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Boundary Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={boundaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="over" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="fours" fill="#3b82f6" name="Fours" />
                      <Bar dataKey="sixes" fill="#10b981" name="Sixes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {boundaryData.reduce((sum, over) => sum + over.fours, 0)}
                    </div>
                    <div className="text-sm text-cricket-gray">Total Fours</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {boundaryData.reduce((sum, over) => sum + over.sixes, 0)}
                    </div>
                    <div className="text-sm text-cricket-gray">Total Sixes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-cricket-primary mb-2">
                      {boundaryData.reduce((sum, over) => sum + over.fours + over.sixes, 0)}
                    </div>
                    <div className="text-sm text-cricket-gray">Total Boundaries</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}