import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Users, 
  BarChart3,
  MessageSquare,
  Activity
} from 'lucide-react';

export default function Home() {
  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const hasTeams = Array.isArray(teams) && teams.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cricket-primary rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Cricket Companion</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <span className="text-gray-900 dark:text-white font-medium border-b-2 border-cricket-primary pb-2">Dashboard</span>
              </Link>
              <Link href="/teams">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Teams</span>
              </Link>
              <Link href="/matches/history">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Matches</span>
              </Link>
              <Link href="/analytics">
                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Analytics</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/teams">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Teams
                </Button>
              </Link>
              {hasTeams ? (
                <Link href="/matches/new">
                  <Button className="bg-cricket-primary hover:bg-green-600">
                    New Match
                  </Button>
                </Link>
              ) : (
                <Link href="/teams">
                  <Button className="bg-cricket-primary hover:bg-green-600">
                    New Match
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Professional
                <br />
                <span className="text-cricket-primary">Cricket</span>
                <br />
                <span className="text-cricket-primary">Management</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                Complete cricket team and match management with AI-powered commentary, real-time scoring, and advanced analytics.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {hasTeams ? (
                <Link href="/matches/new">
                  <Button size="lg" className="bg-cricket-primary hover:bg-green-600">
                    <Play className="h-5 w-5 mr-2" />
                    Start New Match
                  </Button>
                </Link>
              ) : (
                <Link href="/teams">
                  <Button size="lg" className="bg-cricket-primary hover:bg-green-600">
                    <Play className="h-5 w-5 mr-2" />
                    Start New Match
                  </Button>
                </Link>
              )}
              
              <Link href="/teams">
                <Button variant="outline" size="lg">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Teams
                </Button>
              </Link>
            </div>

            {/* Feature Tags */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-2 bg-cricket-primary/10 text-cricket-primary px-3 py-1 rounded-full text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>AI Commentary</span>
              </div>
              <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
                <BarChart3 className="h-4 w-4" />
                <span>Live Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="space-y-6">
            
            {/* Ball-by-Ball Scoring Card */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cricket-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-cricket-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ball-by-Ball Scoring</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Real-time scoring interface with undo functionality and live statistics updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Commentary Card */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Commentary</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Hindi commentary in Akash Chopra's style
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Analytics Card */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Match Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Shot charts and performance insights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Empty State for No Teams */}
        {!hasTeams && (
          <div className="mt-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-cricket-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No teams created yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Click 'Create Team' to begin.
              </p>
              <Link href="/teams">
                <Button className="bg-cricket-primary hover:bg-green-600">
                  Create Team
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}