import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Settings } from 'lucide-react';

export default function NewMatch() {
  const [, setLocation] = useLocation();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [matchSettings, setMatchSettings] = useState({
    overs: 20,
    matchType: 'T20',
    venue: '',
    tossWinner: '',
    tossChoice: 'bat'
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => fetch('/api/teams').then(res => res.json()),
  });

  const createMatchMutation = useMutation({
    mutationFn: (newMatch: any) =>
      fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMatch),
      }).then(res => res.json()),
    onSuccess: (data) => {
      setLocation(`/matches/live/${data.id}`);
    },
  });

  const canStartMatch = selectedTeams.length === 2 && matchSettings.venue && matchSettings.tossWinner;

  const handleStartMatch = () => {
    if (!canStartMatch) return;

    const newMatch = {
      team1Id: selectedTeams[0],
      team2Id: selectedTeams[1],
      format: matchSettings.matchType,
      oversPerInnings: matchSettings.overs,
      tossWinnerId: matchSettings.tossWinner,
      tossDecision: matchSettings.tossChoice,
    };

    createMatchMutation.mutate(newMatch);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (!teams || teams.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                Need More Teams
              </h2>
              <p className="text-cricket-gray mb-8">
                You need at least 2 teams to start a match. Create teams first.
              </p>
              <Link href="/teams">
                <Button size="lg" className="bg-cricket-primary hover:bg-green-600">
                  Manage Teams
                </Button>
              </Link>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">New Match</h1>
              <p className="text-cricket-gray">Set up a new cricket match</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team: any) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTeams.includes(team.id)
                        ? 'border-cricket-primary bg-cricket-primary/5'
                        : 'border-gray-200 hover:border-cricket-primary/50'
                    }`}
                    onClick={() => {
                      if (selectedTeams.includes(team.id)) {
                        setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                      } else if (selectedTeams.length < 2) {
                        setSelectedTeams([...selectedTeams, team.id]);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-cricket-gray">{team.homeGround}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedTeams.includes(team.id)
                          ? 'bg-cricket-primary border-cricket-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedTeams.includes(team.id) && (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Match Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Match Format</label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={matchSettings.matchType}
                    onChange={(e) => setMatchSettings({
                      ...matchSettings,
                      matchType: e.target.value,
                      overs: e.target.value === 'T20' ? 20 : 50
                    })}
                  >
                    <option value="T20">T20 (20 overs)</option>
                    <option value="ODI">ODI (50 overs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter match venue"
                    value={matchSettings.venue}
                    onChange={(e) => setMatchSettings({
                      ...matchSettings,
                      venue: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Toss Winner</label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={matchSettings.tossWinner}
                    onChange={(e) => setMatchSettings({
                      ...matchSettings,
                      tossWinner: e.target.value
                    })}
                  >
                    <option value="">Select toss winner</option>
                    {selectedTeams.map(teamId => {
                      const team = teams.find((t: any) => t.id === teamId);
                      return team ? (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ) : null;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Toss Choice</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tossChoice"
                        value="bat"
                        checked={matchSettings.tossChoice === 'bat'}
                        onChange={(e) => setMatchSettings({
                          ...matchSettings,
                          tossChoice: e.target.value
                        })}
                        className="mr-2"
                      />
                      Bat First
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tossChoice"
                        value="bowl"
                        checked={matchSettings.tossChoice === 'bowl'}
                        onChange={(e) => setMatchSettings({
                          ...matchSettings,
                          tossChoice: e.target.value
                        })}
                        className="mr-2"
                      />
                      Bowl First
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Match Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleStartMatch}
            disabled={!canStartMatch}
            size="lg"
            className="bg-cricket-primary hover:bg-green-600 disabled:opacity-50"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Match
          </Button>
          {!canStartMatch && (
            <p className="text-sm text-cricket-gray mt-2">
              Please select 2 teams, enter venue, and choose toss winner to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
