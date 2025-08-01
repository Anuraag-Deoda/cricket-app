import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCricketStore } from "@/store/cricket-store";

export default function TeamsInterface() {
  const { teams, players, match } = useCricketStore();
  
  const team1 = teams.find(t => t.id === match.currentMatch?.team1Id);
  const team2 = teams.find(t => t.id === match.currentMatch?.team2Id);
  
  const team1Players = players.filter(p => p.teamId === team1?.id);
  const team2Players = players.filter(p => p.teamId === team2?.id);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman': return 'bg-green-100 text-green-800';
      case 'bowler': return 'bg-red-100 text-red-800';
      case 'all-rounder': return 'bg-blue-100 text-blue-800';
      case 'keeper': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormIndicator = (formRating: number) => {
    if (formRating > 2) return { icon: '📈', color: 'text-green-600', text: 'Hot' };
    if (formRating > 0) return { icon: '📊', color: 'text-blue-600', text: 'Good' };
    if (formRating < -2) return { icon: '📉', color: 'text-red-600', text: 'Poor' };
    return { icon: '➖', color: 'text-gray-600', text: 'Average' };
  };

  const TeamCard = ({ team, players, teamColor }: { 
    team: any, 
    players: any[], 
    teamColor: string 
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <div className={`w-8 h-8 ${teamColor} rounded-full mr-3`}></div>
            <span>{team?.name || 'Team'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm">
            <i className="fas fa-edit"></i>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.length > 0 ? (
            players.map((player) => {
              const form = getFormIndicator(player.formRating);
              return (
                <div key={player.id} className="flex items-center justify-between p-3 bg-cricket-bg rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${teamColor} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {player.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{player.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getRoleColor(player.role)}>
                          {player.role}
                        </Badge>
                        <span className={`text-xs ${form.color}`}>
                          {form.icon} {form.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-cricket-gray">
                    {player.role === 'batsman' || player.role === 'all-rounder' ? (
                      <>
                        <p>Avg: {player.battingAverage.toFixed(1)}</p>
                        <p>SR: {player.strikeRate.toFixed(1)}</p>
                      </>
                    ) : (
                      <>
                        <p>Wkts: {player.wickets}</p>
                        <p>Econ: {player.economy.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-cricket-gray">
              <i className="fas fa-user-plus text-4xl mb-4"></i>
              <p>No players added yet</p>
              <Button className="mt-2 bg-cricket-primary hover:bg-green-600">
                Add Players
              </Button>
            </div>
          )}
        </div>
        {players.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-cricket-gray">
              <span>Squad Size: {players.length}</span>
              <span>Playing XI: {Math.min(players.length, 11)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Team Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-cricket-dark">Team Management</h2>
          <p className="text-cricket-gray">Manage players, track form, and analyze performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <i className="fas fa-plus mr-2"></i>
            Add Team
          </Button>
          <Button className="bg-cricket-primary hover:bg-green-600">
            <i className="fas fa-user-plus mr-2"></i>
            Add Player
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamCard 
          team={team1} 
          players={team1Players} 
          teamColor="bg-cricket-accent"
        />
        <TeamCard 
          team={team2} 
          players={team2Players} 
          teamColor="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <i className="fas fa-exchange-alt text-3xl text-cricket-primary mb-4"></i>
            <h3 className="font-semibold mb-2">Toss</h3>
            <p className="text-sm text-cricket-gray mb-4">Conduct toss and decide batting order</p>
            <Button className="w-full bg-cricket-primary hover:bg-green-600">
              Conduct Toss
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <i className="fas fa-list-ol text-3xl text-cricket-accent mb-4"></i>
            <h3 className="font-semibold mb-2">Batting Order</h3>
            <p className="text-sm text-cricket-gray mb-4">Set and modify batting lineup</p>
            <Button variant="outline" className="w-full">
              Set Order
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <i className="fas fa-chart-bar text-3xl text-green-500 mb-4"></i>
            <h3 className="font-semibold mb-2">Squad Stats</h3>
            <p className="text-sm text-cricket-gray mb-4">View detailed player statistics</p>
            <Button variant="outline" className="w-full">
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-history text-cricket-primary mr-2"></i>
            Recent Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-cricket-gray">
            <i className="fas fa-cricket text-4xl mb-4"></i>
            <p>No recent matches found</p>
            <p className="text-sm">Start a new match to see history here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
