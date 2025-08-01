import type { Match, MatchSettings, Innings, Team, Player, Ball, BallDetails, FielderPlacement, PlayerRole, BowlingStyle, MatchSituation } from '@shared/types';
import { PlayerRole as PlayerRoleEnum, BowlingStyle as BowlingStyleEnum, MatchType } from '@shared/types';

const MAX_PLAYERS = 11;
const SQUAD_SIZE = 15;
const SAVED_TEAMS_KEY = 'cricket-clash-saved-teams';

function createPlayer(id: string, name: string, rating: number, role?: PlayerRole, bowlingStyle?: BowlingStyle): Player {
  return {
    id,
    name,
    rating,
    isSubstitute: false,
    isImpactPlayer: false,
    role: role, // Initialize role
    bowlingStyle: bowlingStyle, // Initialize bowlingStyle
    batting: { runs: 0, ballsFaced: 0, fours: 0, sixes: 0, status: 'did not bat', strikeRate: 0 },
    bowling: { ballsBowled: 0, runsConceded: 0, maidens: 0, wickets: 0, economyRate: 0 },
  };
}

function createTeam(id: string, name: string, players: Player[]): Team {
  return {
    id,
    name,
    players: players.map(p => ({ ...p, isSubstitute: false, isImpactPlayer: false })),
    impactPlayerUsed: false,
  };
}

function createInnings(battingTeam: Team, bowlingTeam: Team): Innings {
  // Set initial batting status
  battingTeam.players.forEach((p, i) => {
    p.batting.status = (p.isSubstitute || i >= MAX_PLAYERS) ? 'did not bat' : 'not out';
  });

  const playingXI = battingTeam.players.filter(p => !p.isSubstitute || p.isImpactPlayer);

  return {
    battingTeam,
    bowlingTeam,
    score: 0,
    wickets: 0,
    overs: 0,
    ballsThisOver: 0,
    timeline: [],
    fallOfWickets: [],
    currentPartnership: { batsman1: playingXI[0]?.id ?? '', batsman2: playingXI[1]?.id ?? '', runs: 0, balls: 0 },
    batsmanOnStrike: playingXI[0]?.id ?? '',
    batsmanNonStrike: playingXI[1]?.id ?? '',
    currentBowler: '', // No bowler selected initially
    fieldPlacements: [], // Initialize field placements as an empty array
    isFreeHit: false,
  };
}

export function createMatch(settings: MatchSettings, allPlayers: Player[]): Match {
  let savedTeams: Record<string, Player[]> = {};
  try {
      const savedTeamsData = localStorage.getItem(SAVED_TEAMS_KEY);
      if (savedTeamsData) {
          savedTeams = JSON.parse(savedTeamsData);
      }
  } catch (e) {
      console.error("Could not load saved teams", e);
  }

  const getTeamPlayers = (name: string): Player[] => {
      if (savedTeams[name]) {
          // When loading from saved teams, ensure role and bowlingStyle are carried over
          return savedTeams[name].map(p => createPlayer(p.id, p.name, p.rating ?? 75, p.role, p.bowlingStyle));
      }
      const shuffledPlayers = [...allPlayers].sort(() => 0.5 - Math.random());
      // Assign default roles/bowling styles or handle appropriately
      return shuffledPlayers.slice(0, SQUAD_SIZE).map((p, index) => {
        let role = PlayerRoleEnum.Batsman; // Default role
        let bowlingStyle: BowlingStyle | undefined = undefined;

        // Simple assignment for demonstration - replace with more sophisticated logic
        if (index === 0) role = PlayerRoleEnum.WicketKeeper; // Assume first player is WK
        else if (index >= 7) { // Assume players 8-11 are bowlers/allrounders
            role = Math.random() > 0.5 ? PlayerRoleEnum.Bowler : PlayerRoleEnum.AllRounder;
            // Assign a random bowling style for bowlers/allrounders
            const styles = Object.values(BowlingStyleEnum);
            bowlingStyle = styles[Math.floor(Math.random() * styles.length)];
        }

        return createPlayer(p.id, p.name, p.rating ?? 75, role, bowlingStyle);
      });
  };
  
  const team1Players = getTeamPlayers(settings.teamNames[0]);
  const team2Players = getTeamPlayers(settings.teamNames[1]);

  const teams: [Team, Team] = [
    createTeam('0', settings.teamNames[0], team1Players),
    createTeam('1', settings.teamNames[1], team2Players),
  ];
  
  teams.forEach(team => {
      for (let i = MAX_PLAYERS; i < SQUAD_SIZE; i++) {
          if(team.players[i]) team.players[i].isSubstitute = true;
      }
  });

  const battingFirstTeam = settings.toss.winner === teams[0].name
    ? (settings.toss.decision === 'bat' ? teams[0] : teams[1])
    : (settings.toss.decision === 'bat' ? teams[1] : teams[0]);
  
  const bowlingFirstTeam = battingFirstTeam.id === teams[0].id ? teams[1] : teams[0];

  const innings = createInnings(battingFirstTeam, bowlingFirstTeam);

  return {
    id: `match_${Date.now()}`,
    teams,
    oversPerInnings: settings.oversPerInnings,
    toss: settings.toss,
    innings: [innings],
    currentInnings: 1,
    status: 'inprogress',
    matchType: settings.matchType,
  };
}

function calculateRatingUpdate(player: Player): number {
    let ratingChange = 0;
    const baseRating = player.rating || 75;

    // Batting performance
    const { runs, ballsFaced, strikeRate } = player.batting;
    if (ballsFaced > 0) {
        ratingChange += runs * 0.1;
        if (runs >= 100) ratingChange += 10;
        else if (runs >= 50) ratingChange += 5;

        if (strikeRate > 150) ratingChange += (strikeRate - 150) * 0.02;
        if (strikeRate < 80 && ballsFaced > 10) ratingChange -= (80 - strikeRate) * 0.02;
    }
    
    // Bowling performance
    const { wickets, ballsBowled, economyRate, maidens } = player.bowling;
    if (ballsBowled > 0) {
        ratingChange += wickets * 2;
        if (wickets >= 5) ratingChange += 10;
        else if (wickets >= 3) ratingChange += 5;
        ratingChange += maidens * 2;

        if (economyRate < 4.0 && ballsBowled >= 12) ratingChange += (4.0 - economyRate);
        if (economyRate > 10.0 && ballsBowled >= 12) ratingChange -= (economyRate - 10.0) * 0.5;
    }

    const newRating = baseRating + ratingChange;
    return Math.max(1, Math.min(100, newRating));
}


function finishMatch(match: Match): Match {
    const newMatch = JSON.parse(JSON.stringify(match));
    newMatch.status = 'finished';

    const score1 = newMatch.innings[0].score;
    const score2 = newMatch.innings.length > 1 ? newMatch.innings[1].score : 0;
    const team1 = newMatch.innings[0].battingTeam;
    const team2 = newMatch.innings[0].bowlingTeam;
    
    if (newMatch.currentInnings === 2 && score2 > score1) {
        const wicketsLeft = MAX_PLAYERS - 1 - newMatch.innings[1].wickets;
        newMatch.result = `${newMatch.innings[1].battingTeam.name} won by ${wicketsLeft} wickets.`;
    } else if (newMatch.currentInnings === 2 && score1 > score2) {
        newMatch.result = `${newMatch.innings[0].battingTeam.name} won by ${score1 - score2} runs.`;
    } else if (score1 === score2) {
        newMatch.status = 'superover';
        newMatch.result = 'Match tied. Starting Super Over!';
        const superOverBattingTeam = newMatch.innings[1].bowlingTeam;
        const superOverBowlingTeam = newMatch.innings[1].battingTeam;
        newMatch.superOver = {
            innings: [createInnings(superOverBattingTeam, superOverBowlingTeam)],
            currentInnings: 1,
        };
        newMatch.oversPerInnings = 1; // Super over is 1 over
    } else if (newMatch.currentInnings === 1 && newMatch.status === 'finished') {
        newMatch.result = `${team1.name} scored ${score1}. Target for ${team2.name} is ${score1 + 1}.`;
    }

    let savedTeams: Record<string, Player[]> = {};
     try {
        const savedTeamsData = localStorage.getItem(SAVED_TEAMS_KEY);
        if (savedTeamsData) {
            savedTeams = JSON.parse(savedTeamsData);
        }
    } catch (e) {
        console.error("Could not load saved teams for updating", e);
    }

    newMatch.teams.forEach((team: Team) => {
        team.players.forEach((player: Player) => {
            const originalPlayer = allPlayersFromMatch(match).find(p => p.id === player.id);
            if(originalPlayer) {
              // When updating ratings, retain role and bowlingStyle
              player.rating = calculateRatingUpdate(originalPlayer);
              player.role = originalPlayer.role; 
              player.bowlingStyle = originalPlayer.bowlingStyle;
            }
        });
        savedTeams[team.name] = JSON.parse(JSON.stringify(team.players));
    });

    try {
        localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(savedTeams));
    } catch (e) {
        console.error("Could not save teams", e);
    }


    return newMatch;
}

function allPlayersFromMatch(match: Match): Player[] {
    const playersMap = new Map<string, Player>();

    match.innings.forEach(inning => {
        [...inning.battingTeam.players, ...inning.bowlingTeam.players].forEach(p => {
            if (!playersMap.has(p.id)) {
                playersMap.set(p.id, JSON.parse(JSON.stringify(p)));
            } else {
                const existingPlayer = playersMap.get(p.id)!;
                if (p.batting.ballsFaced > existingPlayer.batting.ballsFaced) {
                    existingPlayer.batting = {...p.batting};
                }
                 if (p.bowling.ballsBowled > existingPlayer.bowling.ballsBowled) {
                    existingPlayer.bowling = {...p.bowling};
                }
                if (p.isSubstitute) existingPlayer.isSubstitute = p.isSubstitute;
                if (p.isImpactPlayer) existingPlayer.isImpactPlayer = p.isImpactPlayer;
                // Ensure role and bowlingStyle are copied over
                if (p.role) existingPlayer.role = p.role;
                if (p.bowlingStyle) existingPlayer.bowlingStyle = p.bowlingStyle;
            }
        });
    });

    return Array.from(playersMap.values());
}


function endOfInnings(match: Match): Match {
    const newMatch = JSON.parse(JSON.stringify(match));
    if (newMatch.currentInnings === 1) {
        newMatch.currentInnings = 2;
        const newBattingTeam = newMatch.teams.find((t: Team) => t.id === newMatch.innings[0].bowlingTeam.id)!;
        const newBowlingTeam = newMatch.teams.find((t: Team) => t.id === newMatch.innings[0].battingTeam.id)!;
        const newInnings = createInnings(newBattingTeam, newBowlingTeam);
        newMatch.innings.push(newInnings);
    } else {
        return finishMatch(newMatch);
    }
    return newMatch;
}

function updateStats(match: Match, ball: BallDetails): Match {
    const newMatch = JSON.parse(JSON.stringify(match));
    let currentInnings: Innings = newMatch.innings[newMatch.currentInnings - 1];
    
    const battingTeam = currentInnings.battingTeam;
    const bowlingTeam = currentInnings.bowlingTeam;

    let onStrike = battingTeam.players.find((p: Player) => p.id === currentInnings.batsmanOnStrike);
    const bowler = bowlingTeam.players.find((p: Player) => p.id === currentInnings.currentBowler)!;
    
    const isLegalBall = ball.event !== 'wd' && ball.event !== 'nb';
    
    if (ball.event === 'nb') {
      currentInnings.isFreeHit = true;
    } else if (isLegalBall) {
      currentInnings.isFreeHit = false;
    }

    currentInnings.score += ball.runs + ball.extras;
    
    // Update bowler stats first
    bowler.bowling.runsConceded += ball.runs + ball.extras;
    if (isLegalBall) {
        bowler.bowling.ballsBowled++;
        currentInnings.ballsThisOver++;
    }

    if (onStrike) {
        // Update batting stats
        if (isLegalBall) {
            onStrike.batting.ballsFaced++;
            currentInnings.currentPartnership.balls++;
        }
        
        if (ball.event === 'run') {
            onStrike.batting.runs += ball.runs;
            currentInnings.currentPartnership.runs += ball.runs;
            if (ball.runs === 4) onStrike.batting.fours++;
            if (ball.runs === 6) onStrike.batting.sixes++;
        }
    }


    if (ball.event === 'w') {
        if (currentInnings.isFreeHit && ball.wicketType !== 'Run Out') {
          // On a free hit, only run outs are dismissals
        } else {
          currentInnings.wickets++;
          if (onStrike) {
              onStrike.batting.status = 'out';
              
              const fielder = bowlingTeam.players.find((p: Player) => p.id === ball.fielderId);
            let outDetails = `c. ${fielder?.name || 'Fielder'} b. ${bowler.name}`;

            switch (ball.wicketType) {
                case "Caught":
                    outDetails = `c. ${fielder?.name || 'Fielder'} b. ${bowler.name}`;
                    bowler.bowling.wickets++;
                    break;
                case "Run Out":
                   outDetails = `run out (${fielder?.name || 'Fielder'})`;
                   break;
                case "Stumped":
                    outDetails = `st. ${fielder?.name || 'Fielder'} b. ${bowler.name}`;
                    bowler.bowling.wickets++;
                    break;
                default: // Bowled, LBW, Hit Wicket
                    outDetails = `${ball.wicketType} b. ${bowler.name}`;
                    bowler.bowling.wickets++;
                    break;
            }
            
            onStrike.batting.outDetails = outDetails;
            
            currentInnings.fallOfWickets.push({
                wicket: currentInnings.wickets,
                score: currentInnings.score,
                over: currentInnings.overs + currentInnings.ballsThisOver / 10,
                playerOut: onStrike.name,
            });
            
            const playingXI = battingTeam.players.filter((p: Player) => !p.isSubstitute || p.isImpactPlayer);
            if (currentInnings.wickets < playingXI.length - 1) {
                let nextBatsman = battingTeam.players.find((p: Player) => p.batting.status === 'not out' && p.id !== currentInnings.batsmanNonStrike && (!p.isSubstitute || p.isImpactPlayer));
               
                if(nextBatsman) {
                    currentInnings.batsmanOnStrike = nextBatsman.id
                } else {
                    currentInnings.batsmanOnStrike = '';
                }

                currentInnings.currentPartnership = {
                     batsman1: currentInnings.batsmanOnStrike, 
                     batsman2: currentInnings.batsmanNonStrike, 
                     runs: 0,
                     balls: 0 
                };
            } else {
                 currentInnings.batsmanOnStrike = '';
            }
          }
        }
    }

    if (onStrike && ball.runs % 2 === 1 && isLegalBall) {
        [currentInnings.batsmanOnStrike, currentInnings.batsmanNonStrike] = [currentInnings.batsmanNonStrike, currentInnings.batsmanOnStrike];
    }
    
    // Check for end of over
    if (currentInnings.ballsThisOver === 6) {
        currentInnings.overs++;
        currentInnings.ballsThisOver = 0;
        
        // Change strike
        [currentInnings.batsmanOnStrike, currentInnings.batsmanNonStrike] = [currentInnings.batsmanNonStrike, currentInnings.batsmanOnStrike];
        
        // Check for maiden
        const overTimeline = currentInnings.timeline.slice(currentInnings.timeline.length - 5);
        const runsInOver = overTimeline.reduce((acc, b) => acc + b.runs + b.extras, ball.runs + ball.extras);
        if(runsInOver === 0 && overTimeline.every(b => b.extras === 0) && ball.extras === 0) {
            bowler.bowling.maidens++;
        }
        
        // Reset bowler for next over
        if (currentInnings.overs < newMatch.oversPerInnings) {
            currentInnings.currentBowler = '';
             // Clear field placements at the end of the over
            newMatch.innings[newMatch.currentInnings - 1].fieldPlacements = [];
        }
    }

    // Update player SR and bowler economy
    battingTeam.players.forEach(p => {
        if (p.batting.ballsFaced > 0) {
          p.batting.strikeRate = (p.batting.runs / p.batting.ballsFaced) * 100;
        }
    });
    
    bowlingTeam.players.forEach(p => {
        if (p.bowling.ballsBowled > 0) {
            p.bowling.economyRate = p.bowling.runsConceded / (p.bowling.ballsBowled / 6);
        }
    });

    const playingXI = battingTeam.players.filter((p: Player) => !p.isSubstitute || p.isImpactPlayer);
    const allOut = currentInnings.wickets >= playingXI.length - 1;
    const oversFinished = currentInnings.overs >= newMatch.oversPerInnings;
    
    if (allOut || oversFinished) {
        return endOfInnings(newMatch);
    }
    
    if (newMatch.currentInnings === 2 && currentInnings.score > newMatch.innings[0].score) {
        return finishMatch(newMatch);
    }

    return newMatch;
}

export function processBall(match: Match, ball: BallDetails): Match | null {
    if (match.status === 'finished') return match;

    if (match.status === 'superover' && match.superOver) {
        const newMatch = JSON.parse(JSON.stringify(match));
        if (!newMatch.superOver) return newMatch; // Should not happen
        const superOver = newMatch.superOver;
        let currentInnings = superOver.innings[superOver.currentInnings - 1];

        if (currentInnings.currentBowler === '') {
            console.error("No bowler selected for super over");
            return null;
        }

        const newBall: Ball = {
            ...ball,
            isWicket: ball.event === 'w',
            batsmanId: currentInnings.batsmanOnStrike,
            bowlerId: currentInnings.currentBowler,
            display: '',
            over: currentInnings.overs + (currentInnings.ballsThisOver / 10)
        };

        const updatedMatch = updateStats(newMatch, ball);
        if (!updatedMatch.superOver) return updatedMatch;
        const updatedSuperOverInnings = updatedMatch.superOver.innings[updatedMatch.superOver.currentInnings - 1];
        updatedSuperOverInnings.timeline.push(newBall);

        if (updatedSuperOverInnings.overs >= 1 || updatedSuperOverInnings.wickets >= 2) {
            if (updatedMatch.superOver.currentInnings === 1) {
                updatedMatch.superOver.currentInnings = 2;
                const newBattingTeam = updatedMatch.superOver.innings[0].bowlingTeam;
                const newBowlingTeam = updatedMatch.superOver.innings[0].battingTeam;
                updatedMatch.superOver.innings.push(createInnings(newBattingTeam, newBowlingTeam));
            } else {
                const score1 = updatedMatch.superOver.innings[0].score;
                const score2 = updatedMatch.superOver.innings[1].score;
                if (score2 > score1) {
                    updatedMatch.result = `${updatedMatch.superOver.innings[1].battingTeam.name} won the super over.`;
                } else if (score1 > score2) {
                    updatedMatch.result = `${updatedMatch.superOver.innings[0].battingTeam.name} won the super over.`;
                } else {
                    updatedMatch.result = 'Super Over tied.';
                }
                updatedMatch.status = 'finished';
            }
        }
        return updatedMatch;
    }
    
    let currentInnings = match.innings[match.currentInnings - 1];
    
    if (currentInnings.currentBowler === '') {
        console.error("No bowler selected");
        return null;
    }

    let displayValue = '';
    switch(ball.event) {
        case 'run': displayValue = ball.runs.toString(); break;
        case 'w': displayValue = 'W'; break;
        case 'wd': displayValue = 'wd'; break;
        case 'nb': displayValue = 'nb'; break;
        case 'lb': displayValue = `${ball.extras}lb`; break;
        case 'b': displayValue = `${ball.extras}b`; break;
    }

    const newBall: Ball = {
        ...ball,
        isWicket: ball.event === 'w',
        batsmanId: currentInnings.batsmanOnStrike,
        bowlerId: currentInnings.currentBowler,
        display: displayValue,
        over: currentInnings.overs + (currentInnings.ballsThisOver / 10)
    };

    const newMatch = updateStats(match, ball);
    const newCurrentInnings = newMatch.innings[newMatch.currentInnings - 1];
    
    // Only push to timeline if it's the same innings
    if (newMatch.currentInnings === match.currentInnings) {
       newCurrentInnings.timeline.push(newBall);
    } else if (newMatch.innings.length > match.innings.length) {
        // If new innings, the ball belongs to the previous one
        newMatch.innings[match.currentInnings-1].timeline.push(newBall);
    }

    return newMatch;
}

export function undoLastBall(match: Match): Match | null {
    const originalMatchState = JSON.parse(JSON.stringify(match));
    if (originalMatchState.innings[0].timeline.length === 0 && originalMatchState.innings.length === 1) return null;

    let replayedMatch = createMatch(
        {
            teamNames: [match.teams[0].name, match.teams[1].name],
            oversPerInnings: match.oversPerInnings,
            toss: match.toss,
            matchType: match.matchType,
        },
        match.teams.flatMap(t => t.players)
    );
    
    replayedMatch.teams = JSON.parse(JSON.stringify(match.teams));
    
    const allBalls = originalMatchState.innings.flatMap((i: Innings) => i.timeline);
    allBalls.pop();

    if (allBalls.length === 0) {
       const battingFirstTeam = match.toss.winner === match.teams[0].name
        ? (match.toss.decision === 'bat' ? match.teams[0] : match.teams[1])
        : (match.toss.decision === 'bat' ? match.teams[1] : match.teams[0]);
  
      const bowlingFirstTeam = battingFirstTeam.id === match.teams[0].id ? match.teams[1] : match.teams[0];
      replayedMatch.innings = [createInnings(battingFirstTeam, bowlingFirstTeam)];
      return replayedMatch;
    }


    replayedMatch.innings = [createInnings(replayedMatch.teams.find(t => t.id === match.innings[0].battingTeam.id)!, replayedMatch.teams.find(t => t.id === match.innings[0].bowlingTeam.id)! )]
    replayedMatch.currentInnings = 1;


    for(const ball of allBalls) {
        let currentInnings = replayedMatch.innings[replayedMatch.currentInnings - 1];
        
        if (currentInnings.currentBowler === '') {
            currentInnings.currentBowler = ball.bowlerId;
        }

        const processedMatch = processBall(replayedMatch, { ...ball });

        if (processedMatch) {
            replayedMatch = processedMatch;
        }
    }
    
    const finalInnings = replayedMatch.innings[replayedMatch.currentInnings - 1];
    const lastBall = allBalls[allBalls.length - 1];
    if(lastBall) {
        if (finalInnings.ballsThisOver > 0) {
            finalInnings.currentBowler = lastBall.bowlerId;
        }
    }
    
    return replayedMatch;
}

export function updateFieldPlacements(match: Match, placements: FielderPlacement[]): Match {
    const newMatch = JSON.parse(JSON.stringify(match));
    const currentInnings = newMatch.innings[newMatch.currentInnings - 1];
    currentInnings.fieldPlacements = placements;
    return newMatch;
}

// Function to update player roles and bowling styles
export function updatePlayerAttributes(match: Match, teamId: string, playerId: string, role?: PlayerRole, bowlingStyle?: BowlingStyle): Match {
    const newMatch = JSON.parse(JSON.stringify(match));
    const team = newMatch.teams.find((t: Team) => t.id === teamId);
    if (!team) return newMatch; // Should not happen

    const player = team.players.find((p: Player) => p.id === playerId);
    if (!player) return newMatch; // Should not happen

    if (role !== undefined) player.role = role;
    if (bowlingStyle !== undefined) player.bowlingStyle = bowlingStyle;

    // Also update in the other team's player list if the player exists there (e.g., for rating updates)
    const otherTeam = newMatch.teams.find((t: Team) => t.id !== teamId);
    if (otherTeam) {
        const playerInOtherTeam = otherTeam.players.find((p: Player) => p.id === playerId);
        if (playerInOtherTeam) {
            if (role !== undefined) playerInOtherTeam.role = role;
            if (bowlingStyle !== undefined) playerInOtherTeam.bowlingStyle = bowlingStyle;
        }
    }

    return newMatch;
}

// Function to get available bowlers, excluding wicket keepers
export function getAvailableBowlers(innings: Innings): Player[] {
    return innings.bowlingTeam.players.filter(p => 
        (!p.isSubstitute || p.isImpactPlayer) && 
        p.id !== innings.currentBowler && // Exclude current bowler
        p.role !== PlayerRoleEnum.WicketKeeper // Exclude wicket keepers
    );
}

export function getMatchSituation(match: Match): MatchSituation {
  const currentInningsNumber = match.currentInnings;
  const currentInnings = match.innings[currentInningsNumber - 1];
  const battingTeamName = currentInnings.battingTeam.name;
  const bowlingTeamName = currentInnings.bowlingTeam.name;
  const oversLeft = match.oversPerInnings - currentInnings.overs;
  const isChasing = currentInningsNumber === 2;

  let situation: MatchSituation = {
    innings: currentInningsNumber,
    battingTeamName,
    bowlingTeamName,
    oversLeft,
    isChasing,
  };

  if (isChasing) {
    const target = match.innings[0].score + 1;
    const runsNeeded = target - currentInnings.score;
    const ballsBowled = currentInnings.overs * 6 + currentInnings.ballsThisOver;
    const totalBalls = match.oversPerInnings * 6;
    const ballsRemaining = totalBalls - ballsBowled;

    situation = {
      ...situation,
      target,
      runsNeeded,
      ballsRemaining,
    };
  }

  return situation;
}

export function getPowerplayOvers(matchType: MatchType): number {
  switch (matchType) {
    case MatchType.T20:
      return 6;
    case MatchType.FiftyOvers:
      return 10;
    case MatchType.TenOvers:
      return 3;
    case MatchType.FiveOvers:
      return 1;
    case MatchType.TwoOvers:
      return 1;
    default:
      return 0;
  }
}

export function calculateCurrentRunRate(score: number, balls: number): number {
  if (balls === 0) return 0;
  return (score / balls) * 6;
}

export function calculateRequiredRunRate(target: number, score: number, ballsRemaining: number): number {
  if (ballsRemaining <= 0) return 999; // Infinite RRR
  const runsNeeded = target - score;
  if (runsNeeded <= 0) return 0;
  return (runsNeeded / ballsRemaining) * 6;
}
