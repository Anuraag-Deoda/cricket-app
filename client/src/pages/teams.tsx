import { useState } from 'react';
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
import { ArrowLeft, Plus, Users, Trophy, Edit, Trash2, Palette } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  shortName: z.string().min(2, 'Short name must be at least 2 characters').max(4, 'Short name must be at most 4 characters'),
  logo: z.string().optional(),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

// Brand colors for cricket teams
const TEAM_COLORS = [
  { name: 'Royal Blue', value: '#1e40af', bg: 'bg-blue-700' },
  { name: 'Cricket Green', value: '#16a34a', bg: 'bg-green-600' },
  { name: 'Flame Red', value: '#dc2626', bg: 'bg-red-600' },
  { name: 'Sunset Orange', value: '#ea580c', bg: 'bg-orange-600' },
  { name: 'Golden Yellow', value: '#ca8a04', bg: 'bg-yellow-600' },
  { name: 'Royal Purple', value: '#9333ea', bg: 'bg-purple-600' },
  { name: 'Sky Blue', value: '#0284c7', bg: 'bg-sky-600' },
  { name: 'Emerald', value: '#059669', bg: 'bg-emerald-600' },
  { name: 'Rose Pink', value: '#e11d48', bg: 'bg-rose-600' },
  { name: 'Amber', value: '#d97706', bg: 'bg-amber-600' },
];

export default function Teams() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const { toast } = useToast();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  const { data: players } = useQuery({
    queryKey: ['/api/players'],
  });

  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].value);

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      shortName: '',
      logo: selectedColor,
      country: '',
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof teamSchema>) => {
      const teamData = {
        ...data,
        logo: selectedColor, // Use selected color as logo/brand color
      };
      const response = await fetch('/api/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setShowCreateForm(false);
      form.reset();
      setSelectedColor(TEAM_COLORS[0].value);
      toast({
        title: "Team created successfully!",
        description: "Your new team has been added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof teamSchema> }) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update team');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setEditingTeam(null);
      form.reset();
      toast({
        title: "Team updated successfully!",
        description: "Team details have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team deleted",
        description: "The team has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof teamSchema>) => {
    console.log('Form data:', data); // Debug log
    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data: { ...data, logo: selectedColor } });
    } else {
      createTeamMutation.mutate(data);
    }
  };

  const generateShortName = (name: string) => {
    // Auto-generate short name from team name
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    } else if (words.length === 2) {
      return (words[0].substring(0, 2) + words[1].substring(0, 1)).toUpperCase();
    } else {
      return words.slice(0, 3).map(w => w.substring(0, 1)).join('').toUpperCase();
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    form.setValue('name', team.name);
    form.setValue('shortName', team.shortName);
    form.setValue('country', team.country);
    if (team.logo) {
      setSelectedColor(team.logo);
    }
    setShowCreateForm(true);
  };

  const handleDelete = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingTeam(null);
    form.reset();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-cricket-dark dark:text-white">Teams & Players</h1>
                <p className="text-cricket-gray">Manage your cricket teams and player roster</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTeam(null);
                form.reset();
                setShowCreateForm(true);
              }}
              className="bg-cricket-primary hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam ? 'Edit the details of your team.' : 'Add a new cricket team with custom colors and details.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Mumbai Indians, Royal Challengers"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const shortName = generateShortName(e.target.value);
                          form.setValue('shortName', shortName);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name (2-4 characters)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., MI, RCB, CSK"
                        {...field}
                        maxLength={4}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country/City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., India, Mumbai, Bangalore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Team Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {TEAM_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`
                        w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all
                        ${color.bg}
                        ${selectedColor === color.value
                          ? 'border-white shadow-lg scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {TEAM_COLORS.find(c => c.value === selectedColor)?.name}
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-cricket-primary hover:bg-green-600"
                  disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
                >
                  {createTeamMutation.isPending || updateTeamMutation.isPending
                    ? 'Saving...'
                    : editingTeam
                    ? 'Update Team'
                    : 'Create Team'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="container mx-aI have successfully set up the project to run with a SQLite database. The application is now running and accessible at http://localhost:5000.uto px-4 py-8">
        {!Array.isArray(teams) || teams.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-cricket-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-cricket-primary" />
              </div>
              <h2 className="text-2xl font-bold text-cricket-dark dark:text-white mb-4">
                No teams found
              </h2>
              <p className="text-cricket-gray mb-8">
                Create your first team to start managing players and organizing matches.
              </p>
              <Button
                onClick={() => {
                  setEditingTeam(null);
                  form.reset();
                  setShowCreateForm(true);
                }}
                size="lg"
                className="bg-cricket-primary hover:bg-green-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Team
              </Button>
            </div>
          </div>
        ) : (
          // Teams Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(teams) && teams.map((team: any) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg"
                        style={{ backgroundColor: team.logo || '#10b981' }}
                      >
                        {team.shortName || team.name?.substring(0, 2)?.toUpperCase() || 'T'}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <p className="text-sm text-cricket-gray">{team.country || 'Unknown Location'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-cricket-gray">Short Name</div>
                      <div className="font-bold text-sm">{team.shortName || 'N/A'}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-cricket-gray">Players:</span>
                      <span className="font-semibold">
                        {Array.isArray(players) ? players.filter((p: any) => p.teamId === team.id).length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cricket-gray">Matches:</span>
                      <span className="font-semibold">{team.matchesPlayed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cricket-gray">Win Rate:</span>
                      <span className="font-semibold text-cricket-primary">
                        {team.matchesPlayed > 0 
                          ? `${Math.round((team.matchesWon / team.matchesPlayed) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/players" className="block w-full">
                        <Button variant="outline" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Players
                        </Button>
                      </Link>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEdit(team)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(team.id)}
                          disabled={deleteTeamMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Player Stats Summary */}
        {Array.isArray(players) && players.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-cricket-dark dark:text-white mb-6">
              Player Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-cricket-primary">
                    {Array.isArray(players) ? players.length : 0}
                  </div>
                  <div className="text-sm text-cricket-gray">Total Players</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-cricket-primary">
                    {Array.isArray(players) ? players.filter((p: any) => p.role === 'batsman').length : 0}
                  </div>
                  <div className="text-sm text-cricket-gray">Batsmen</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-cricket-primary">
                    {Array.isArray(players) ? players.filter((p: any) => p.role === 'bowler').length : 0}
                  </div>
                  <div className="text-sm text-cricket-gray">Bowlers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-cricket-primary">
                    {Array.isArray(players) ? players.filter((p: any) => p.role === 'all-rounder').length : 0}
                  </div>
                  <div className="text-sm text-cricket-gray">All-rounders</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
