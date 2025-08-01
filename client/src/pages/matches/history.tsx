import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Trophy, TrendingUp } from 'lucide-react';

export default function MatchHistory() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['/api/matches'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading match history...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">Match History</h1>
              <p className="text-cricket-gray">View all completed matches and scorecards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!matches || matches.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                No matches played yet
              </h2>
              <p className="text-cricket-gray mb-8">
                Start your first match to see match history and statistics here.
              </p>
              <Link href="/matches/new">
                <Button size="lg" className="bg-cricket-primary hover:bg-green-600">
                  Start New Match
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Match History List
          <div className="space-y-6">
            {matches.map((match: any) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cricket-primary/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-cricket-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {match.team1Name} vs {match.team2Name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-cricket-gray">
                          <span>{match.venue}</span>
                          <span>•</span>
                          <span>{match.date}</span>
                          <span>•</span>
                          <span className="bg-cricket-primary/10 text-cricket-primary px-2 py-1 rounded">
                            {match.matchType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cricket-dark dark:text-white">
                        {match.status === 'completed' ? 'Completed' : 'Live'}
                      </div>
                      <div className="text-sm text-cricket-primary font-semibold">
                        {match.winner ? `${match.winner} won` : 'In Progress'}
                      </div>
                    </div>
                  </div>

                  {/* Score Summary */}
                  <div className="mt-4 p-4 bg-cricket-bg rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{match.team1Name}</span>
                          <span className="text-lg font-bold">
                            {match.team1Score}/{match.team1Wickets}
                          </span>
                          <span className="text-sm text-cricket-gray">
                            ({match.team1Overs} overs)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{match.team2Name}</span>
                          <span className="text-lg font-bold">
                            {match.team2Score}/{match.team2Wickets}
                          </span>
                          <span className="text-sm text-cricket-gray">
                            ({match.team2Overs} overs)
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Scorecard
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Match Highlights */}
                  {match.highlights && (
                    <div className="mt-4 text-sm text-cricket-gray">
                      <strong>Highlights:</strong> {match.highlights}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}