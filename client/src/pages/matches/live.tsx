import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  RotateCcw, 
  Users, 
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useCricketStore } from '@/store/cricket-store';
import Scoreboard from '@/components/scoreboard';

export default function LiveScoring() {
  const { matchId } = useParams<{ matchId: string }>();
  const { toast } = useToast();
  const { match, setMatch, processBall, setPlayer } = useCricketStore();
  const [selection, setSelection] = useState<
    "striker" | "non-striker" | "bowler" | null
  >(null);

  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['/api/matches', matchId],
    queryFn: () => fetch(`/api/matches/${matchId}`).then(res => res.json()),
    enabled: !!matchId,
  });

  useEffect(() => {
    if (matchData) {
      setMatch(matchData);
    }
  }, [matchData, setMatch]);

  const handlePlayerSelect = (playerId: string) => {
    if (selection && matchId) {
      setPlayer(matchId, selection, playerId);
      setSelection(null);
    }
  };

  const addRuns = (runs: number, extras?: string) => {
    if (!match?.innings[match.currentInnings - 1].batsmanOnStrike || !match?.innings[match.currentInnings - 1].currentBowler) {
      toast({
        title: "Selection needed",
        description: "Please select striker, non-striker, and bowler.",
        variant: "destructive",
      });
      return;
    }
    processBall({
      event: 'run',
      runs,
      extras: extras ? 1 : 0,
    });
  };

  const addWicket = (wicketType: string) => {
    processBall({
      event: 'w',
      runs: 0,
      extras: 0,
      wicketType,
    });
  };

  if (matchLoading || !match || !match.innings || match.innings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cricket-primary mx-auto mb-4"></div>
          <p className="text-cricket-gray">Loading match...</p>
        </div>
      </div>
    );
  }

  const currentInnings = match.innings[match.currentInnings - 1];
  const team1 = match.teams[0];
  const team2 = match.teams[1];
  const balls = currentInnings.timeline;

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
                  Live Scoring
                </h1>
                <p className="text-cricket-gray">
                  {team1?.name} vs {team2?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Undo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="scoring">
          <TabsList>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
          </TabsList>
          <TabsContent value="scoring">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Scoring Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Current Score</span>
                      <Badge className="bg-cricket-primary text-white">
                        Innings {currentInnings.battingTeam.name}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-cricket-primary mb-2">
                        {currentInnings.score}/{currentInnings.wickets}
                      </div>
                      <div className="text-xl text-cricket-gray">
                        ({currentInnings.overs}.{currentInnings.ballsThisOver} overs)
                      </div>
                    </div>

                    {/* Runs Buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[0, 1, 2, 3, 4, 6].map((runs) => (
                        <Button
                          key={runs}
                          variant={
                            runs === 0
                              ? "outline"
                              : runs === 6
                              ? "default"
                              : "secondary"
                          }
                          className={
                            runs === 6
                              ? "bg-cricket-primary hover:bg-green-600"
                              : ""
                          }
                          onClick={() => addRuns(runs)}
                        >
                          {runs}
                        </Button>
                      ))}
                    </div>

                    {/* Extras */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRuns(1, "wide")}
                      >
                        Wide
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRuns(1, "noball")}
                      >
                        No Ball
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRuns(1, "bye")}
                      >
                        Bye
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRuns(1, "legbye")}
                      >
                        Leg Bye
                      </Button>
                    </div>

                    {/* Wickets */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => addWicket("bowled")}
                      >
                        Bowled
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => addWicket("caught")}
                      >
                        Caught
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => addWicket("lbw")}
                      >
                        LBW
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Balls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Balls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {balls.slice(-6).map((ball, index) => (
                        <div
                          key={index}
                          className={`
                        min-w-[40px] h-10 rounded-full flex items-center justify-center text-sm font-medium
                        ${
                          ball.isWicket
                            ? "bg-red-100 text-red-800 border-2 border-red-300"
                            : ball.runs === 6
                            ? "bg-green-100 text-green-800 border-2 border-green-300"
                            : ball.runs === 4
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                        >
                          {ball.isWicket ? "W" : ball.runs}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Current Players */}
                <Dialog>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Current Players
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-cricket-gray">
                          Striker:
                        </span>
                        <DialogTrigger
                          asChild
                          onClick={() => setSelection("striker")}
                        >
                          <Button variant="link" className="p-0 h-auto">
                            {currentInnings.battingTeam.players.find(
                              (p) => p.id === currentInnings.batsmanOnStrike
                            )?.name || "Select Batsman"}
                          </Button>
                        </DialogTrigger>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-cricket-gray">
                          Non-Striker:
                        </span>
                        <DialogTrigger
                          asChild
                          onClick={() => setSelection("non-striker")}
                        >
                          <Button variant="link" className="p-0 h-auto">
                            {currentInnings.battingTeam.players.find(
                              (p) => p.id === currentInnings.batsmanNonStrike
                            )?.name || "Select Batsman"}
                          </Button>
                        </DialogTrigger>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-cricket-gray">
                          Bowler:
                        </span>
                        <DialogTrigger
                          asChild
                          onClick={() => setSelection("bowler")}
                        >
                          <Button variant="link" className="p-0 h-auto">
                            {currentInnings.bowlingTeam.players.find(
                              (p) => p.id === currentInnings.currentBowler
                            )?.name || "Select Bowler"}
                          </Button>
                        </DialogTrigger>
                      </div>
                    </CardContent>
                  </Card>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Select {selection === "bowler" ? "Bowler" : "Batsman"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-2">
                      {(selection === "striker" ||
                      selection === "non-striker"
                        ? currentInnings.battingTeam.players
                        : currentInnings.bowlingTeam.players
                      ).map((player) => (
                        <Button
                          key={player.id}
                          variant="ghost"
                          onClick={() => handlePlayerSelect(player.id)}
                          className="w-full justify-start"
                        >
                          {player.name}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Match Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cricket-gray">
                        Format:
                      </span>
                      <span className="font-medium">{match.matchType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cricket-gray">
                        Overs:
                      </span>
                      <span className="font-medium">
                        {match.oversPerInnings}
                      </span>
                    </div>
                    {match.innings.length > 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-cricket-gray">
                          Target:
                        </span>
                        <span className="font-medium text-cricket-primary">
                          {match.innings[0].score + 1}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cricket-gray">Toss:</span>
                      <span className="font-medium text-xs">
                        {match.toss.winner} - {match.toss.decision}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="scoreboard">
            <Scoreboard match={match} setMatch={setMatch} onBowlerChange={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
