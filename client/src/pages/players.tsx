import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Plus, User, TrendingUp, Target, Award, Star, Edit, Trash2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const playerSchema = z.object({
  name: z.string().min(2, 'Player name must be at least 2 characters'),
  teamId: z.string().min(1, 'Team selection is required'),
  role: z.enum(['batsman', 'bowler', 'all-rounder', 'keeper']),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  skillRating: z.number().min(1).max(100).default(50),
});

const BATTING_STYLES = [
  'Right-handed',
  'Left-handed',
];

const BOWLING_STYLES = [
  'Right-arm fast',
  'Right-arm medium',
  'Right-arm spin',
  'Left-arm fast',
  'Left-arm medium', 
  'Left-arm spin'
];

const PLAYER_ROLES = [
  { value: 'batsman', label: 'Batsman', icon: '🏏', color: 'bg-blue-500' },
  { value: 'bowler', label: 'Bowler', icon: '⚡', color: 'bg-red-500' },
  { value: 'all-rounder', label: 'All-Rounder', icon: '⭐', color: 'bg-green-500' },
  { value: 'keeper', label: 'Wicket-Keeper', icon: '🥅', color: 'bg-purple-500' },
];

export default function Players() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const { toast } = useToast();

  const { data: players, isLoading } = useQuery({
    queryKey: ['/api/players'],
  });

  const { data: teams } = useQuery({
    queryKey: ['/api/teams'],
  });

  const form = useForm<z.infer<typeof playerSchema>>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '',
      teamId: '',
      role: 'batsman',
      battingStyle: '',
      bowlingStyle: '',
      skillRating: 50,
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof playerSchema>) => {
      const response = await fetch('/api/players', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create player');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setShowCreateForm(false);
      form.reset();
      toast({
        title: "Player created successfully!",
        description: "New player has been added to the team.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof playerSchema> }) => {
      const response = await fetch(`/api/players/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update player');
        } else {
          throw new Error('An unexpected error occurred');
        }
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setEditingPlayer(null);
      form.reset();
      toast({
        title: "Player updated successfully!",
        description: "Player details have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Player deleted",
        description: "The player has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting player",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof playerSchema>) => {
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, data });
    } else {
      createPlayerMutation.mutate(data);
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    form.setValue('name', player.name);
    form.setValue('teamId', player.teamId);
    form.setValue('role', player.role);
    form.setValue('battingStyle', player.battingStyle || '');
    form.setValue('bowlingStyle', player.bowlingStyle || '');
    form.setValue('skillRating', player.skillRating || 50);
    setShowCreateForm(true);
  };

  const handleDelete = (playerId: string) => {
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      deletePlayerMutation.mutate(playerId);
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingPlayer(null);
    form.reset();
  };

  // Filter players
  const filteredPlayers = Array.isArray(players) ? players.filter((player: any) => {
    const teamMatch = selectedTeam === 'all' || player.teamId === selectedTeam;
    const roleMatch = selectedRole === 'all' || player.role === selectedRole;
    return teamMatch && roleMatch;
  }) : [];

  // Calculate stats
  const totalPlayers = Array.isArray(players) ? players.length : 0;
  const topBatsman = Array.isArray(players) ? players.reduce((top: any, player: any) => 
    (player.battingAverage > (top?.battingAverage || 0)) ? player : top, null) : null;
  const topBowler = Array.isArray(players) ? players.reduce((top: any, player: any) => 
    (player.wickets > (top?.wickets || 0)) ? player : top, null) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/teams">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teams
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">Players Database</h1>
                <p className="text-cricket-gray">Manage player profiles, stats, and ratings</p>
              </div>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingPlayer(null);
                    form.reset();
                  }}
                  className="bg-cricket-primary hover:bg-green-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlayer ? 'Edit Player' : 'Add New Player'}
                  </DialogTitle>
                  <DialogDescription>
                    Create a new player profile with ratings and statistics.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Player Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Virat Kohli, MS Dhoni" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="teamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(teams) && teams.map((team: any) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Player Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PLAYER_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.icon} {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="battingStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batting Style</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select batting style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BATTING_STYLES.map((style) => (
                                  <SelectItem key={style} value={style}>
                                    {style}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bowlingStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bowling Style (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bowling style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BOWLING_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skillRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Rating: {field.value}/100</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Beginner</span>
                            <span>Average</span>
                            <span>Professional</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-cricket-primary hover:bg-green-600"
                        disabled={createPlayerMutation.isPending || updatePlayerMutation.isPending}
                      >
                        {createPlayerMutation.isPending || updatePlayerMutation.isPending ? 
                          'Saving...' : 
                          editingPlayer ? 'Update Player' : 'Add Player'
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cricket-primary mb-2">
                {totalPlayers}
              </div>
              <div className="text-sm text-cricket-gray flex items-center justify-center">
                <User className="h-4 w-4 mr-1" />
                Total Players
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-blue-600 mb-2">
                {topBatsman?.name || 'None'}
              </div>
              <div className="text-sm text-cricket-gray flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Top Batsman ({topBatsman?.battingAverage?.toFixed(1) || '0'} avg)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-red-600 mb-2">
                {topBowler?.name || 'None'}
              </div>
              <div className="text-sm text-cricket-gray flex items-center justify-center">
                <Target className="h-4 w-4 mr-1" />
                Top Bowler ({topBowler?.wickets || 0} wickets)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {Array.isArray(teams) && teams.map((team: any) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {PLAYER_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPlayers.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                No players found
              </h2>
              <p className="text-cricket-gray mb-8">
                {totalPlayers === 0 
                  ? 'Add your first player to start building your squad.'
                  : 'No players match the current filters. Try adjusting your search.'
                }
              </p>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingPlayer(null);
                      form.reset();
                    }}
                    size="lg"
                    className="bg-cricket-primary hover:bg-green-600"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Player
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        ) : (
          // Players Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player: any) => {
              const team = Array.isArray(teams) ? teams.find((t: any) => t.id === player.teamId) : null;
              const roleInfo = PLAYER_ROLES.find(r => r.value === player.role);
              
              return (
                <Card key={player.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${roleInfo?.color || 'bg-gray-500'}`}
                        >
                          {roleInfo?.icon || '👤'}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{player.name}</CardTitle>
                          <p className="text-sm text-cricket-gray">{team?.name || 'No Team'}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {roleInfo?.label || player.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="stats" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stats">Stats</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="stats" className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-cricket-gray">Avg:</span>
                            <span className="ml-2 font-semibold">{player.battingAverage?.toFixed(1) || '0.0'}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">SR:</span>
                            <span className="ml-2 font-semibold">{player.strikeRate?.toFixed(1) || '0.0'}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">50s:</span>
                            <span className="ml-2 font-semibold">{player.fifties || 0}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">100s:</span>
                            <span className="ml-2 font-semibold">{player.hundreds || 0}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">Wickets:</span>
                            <span className="ml-2 font-semibold">{player.wickets || 0}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">Economy:</span>
                            <span className="ml-2 font-semibold">{player.economy?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                        
                        {/* Skill Rating */}
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-cricket-gray">Skill Rating</span>
                            <span className="text-sm font-bold">{player.skillRating || 50}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-cricket-primary h-2 rounded-full transition-all"
                              style={{ width: `${player.skillRating || 50}%` }}
                            ></div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="details" className="space-y-3">
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="text-cricket-gray">Batting:</span>
                            <span className="ml-2">{player.battingStyle || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">Bowling:</span>
                            <span className="ml-2">{player.bowlingStyle || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-cricket-gray">Appearances:</span>
                            <span className="ml-2 font-semibold">{player.appearances || 0}</span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="pt-4 border-t flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEdit(player)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(player.id)}
                        disabled={deletePlayerMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
