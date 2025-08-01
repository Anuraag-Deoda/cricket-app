import { eq } from "drizzle-orm";
import { db } from "../db";
import { 
  teams, players, matches, balls, aiCommentary, matchState,
  type Team as SchemaTeam, type Player as SchemaPlayer, type Match as SchemaMatch, 
  type Ball as SchemaBall, type AICommentary as SchemaAICommentary,
  type InsertTeam, type InsertPlayer, type InsertMatch, type InsertBall, type InsertCommentary
} from "../../shared/schema";
import type { IStorage } from "../storage";
import { 
  Player, Team, Match, Ball, AICommentary,
  PlayerRole, BowlingStyle, MatchType
} from "../../shared/types";

export class DbStorage implements IStorage {
  private shapePlayer(player: SchemaPlayer): Player {
    return {
      ...player,
      rating: player.skillRating || 0,
      isSubstitute: false,
      isImpactPlayer: false,
      role: player.role as PlayerRole,
      bowlingStyle: player.bowlingStyle as BowlingStyle,
      batting: {
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        status: 'did not bat',
        strikeRate: 0,
      },
      bowling: {
        ballsBowled: 0,
        runsConceded: 0,
        maidens: 0,
        wickets: 0,
        economyRate: 0,
      },
    };
  }

  async getAllTeams(): Promise<Team[]> {
    const allTeams = await db.select().from(teams);
    const teamsWithPlayers: Team[] = [];
    for (const team of allTeams) {
      const players = await this.getPlayersByTeam(team.id);
      teamsWithPlayers.push({ ...team, players, impactPlayerUsed: false });
    }
    return teamsWithPlayers;
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return { ...team, players: [], impactPlayerUsed: false };
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    if (!team) return undefined;
    const players = await this.getPlayersByTeam(id);
    return { ...team, players, impactPlayerUsed: false };
  }

  async updateTeam(id: string, teamData: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updatedTeam] = await db.update(teams)
      .set(teamData)
      .where(eq(teams.id, id))
      .returning();
    if (!updatedTeam) return undefined;
    const players = await this.getPlayersByTeam(id);
    return { ...updatedTeam, players, impactPlayerUsed: false };
  }

  async deleteTeam(id: string): Promise<boolean> {
    await db.delete(players).where(eq(players.teamId, id));
    const result = await db.delete(teams).where(eq(teams.id, id)).returning();
    return result.length > 0;
  }

  async getAllPlayers(): Promise<Player[]> {
    const allPlayers = await db.select().from(players);
    return allPlayers.map(p => this.shapePlayer(p));
  }

  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    const playersData = await db.select().from(players).where(eq(players.teamId, teamId));
    return playersData.map(p => this.shapePlayer(p));
  }

  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(playerData).returning();
    return this.shapePlayer(player);
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player ? this.shapePlayer(player) : undefined;
  }

  async updatePlayer(id: string, playerData: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [updatedPlayer] = await db.update(players)
      .set(playerData)
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer ? this.shapePlayer(updatedPlayer) : undefined;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id)).returning();
    return result.length > 0;
  }

  async updatePlayerForm(playerId: string, formChange: number): Promise<void> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (player) {
      const newFormRating = Math.max(-5, Math.min(5, (player.formRating || 0) + formChange));
      await db.update(players)
        .set({ formRating: newFormRating })
        .where(eq(players.id, playerId));
    }
  }

  async getAllMatches(): Promise<Match[]> {
    const allMatches = await db.select().from(matches);
    const fullMatches: Match[] = [];
    for (const match of allMatches) {
      const fullMatch = await this.getMatchById(match.id);
      if (fullMatch) {
        fullMatches.push(fullMatch);
      }
    }
    return fullMatches;
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(matchData).returning();
    const team1 = (await this.getTeamById(match.team1Id))!;
    const team2 = (await this.getTeamById(match.team2Id))!;

    await this.updateMatchState(match.id, {
      battingTeam: { id: team1.id, name: team1.name },
      bowlingTeam: { id: team2.id, name: team2.name },
      score: 0,
      wickets: 0,
      overs: 0,
      ballsThisOver: 0,
      timeline: [],
      fallOfWickets: [],
      currentPartnership: {
        batsman1: '',
        batsman2: '',
        runs: 0,
        balls: 0,
      },
      batsmanOnStrike: '',
      batsmanNonStrike: '',
      currentBowler: '',
      fieldPlacements: [],
      isFreeHit: false,
    });
    return (await this.getMatchById(match.id))!;
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [matchData] = await db.select().from(matches).where(eq(matches.id, id));
    if (!matchData) return undefined;

    const team1 = await this.getTeamById(matchData.team1Id);
    const team2 = await this.getTeamById(matchData.team2Id);
    if (!team1 || !team2) return undefined;

    const inningsState = await this.getMatchState(id);
    if (!inningsState) return undefined;

    const battingTeam = inningsState.battingTeam.id === team1.id ? team1 : team2;
    const bowlingTeam = inningsState.bowlingTeam.id === team1.id ? team1 : team2;

    const fullInnings = {
      ...inningsState,
      battingTeam,
      bowlingTeam,
    };

    return {
      ...matchData,
      teams: [team1, team2],
      toss: {
        winner: matchData.tossWinnerId === team1.id ? team1.name : team2.name,
        decision: matchData.tossDecision as 'bat' | 'bowl',
      },
      innings: [fullInnings],
      matchType: matchData.format as MatchType,
      status: matchData.status as 'inprogress' | 'finished' | 'superover',
      currentInnings: matchData.currentInnings as 1 | 2,
    };
  }

  async updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed'): Promise<void> {
    await db.update(matches)
      .set({ status })
      .where(eq(matches.id, matchId));
  }

  async addBall(ballData: InsertBall): Promise<Ball> {
    const [ball] = await db.insert(balls).values(ballData).returning();
    return {
      ...ball,
      event: ball.extraType || 'run',
      display: ball.commentary || '',
      over: parseInt(ball.overId),
    } as Ball;
  }

  async getBallsByMatch(matchId: string): Promise<Ball[]> {
    const ballsData = await db.select().from(balls).where(eq(balls.matchId, matchId));
    return ballsData.map(b => ({
      ...b,
      event: b.extraType || 'run',
      display: b.commentary || '',
      over: parseInt(b.overId),
    } as Ball));
  }

  async getLastBall(matchId: string): Promise<Ball | undefined> {
    const ballsList = await this.getBallsByMatch(matchId);
    return ballsList[ballsList.length - 1];
  }

  async addCommentary(commentaryData: InsertCommentary): Promise<AICommentary> {
    const [commentary] = await db.insert(aiCommentary).values(commentaryData).returning();
    return {
      ...commentary,
      commentary: commentary.content,
      timestamp: new Date(commentary.timestamp!),
    };
  }

  async getCommentaryByMatch(matchId: string): Promise<AICommentary[]> {
    const commentaryData = await db.select().from(aiCommentary).where(eq(aiCommentary.matchId, matchId));
    return commentaryData.map(c => ({
      ...c,
      commentary: c.content,
      timestamp: new Date(c.timestamp!),
    }));
  }

  async getMatchState(matchId: string): Promise<any> {
    const [state] = await db.select().from(matchState).where(eq(matchState.matchId, matchId));
    if (state && typeof state.state === 'string') {
      return JSON.parse(state.state);
    }
    return state?.state;
  }

  async updateMatchState(matchId: string, state: any): Promise<void> {
    const stateString = JSON.stringify(state);
    await db.insert(matchState)
      .values({ matchId, state: stateString })
      .onConflictDoUpdate({
        target: matchState.matchId,
        set: { state: stateString }
      });
  }

  async updatePlayerSelection(matchId: string, role: "striker" | "non-striker" | "bowler", playerId: string): Promise<Match> {
    const matchState = await this.getMatchState(matchId);
    
    if (role === 'striker') {
      matchState.batsmanOnStrike = playerId;
    } else if (role === 'non-striker') {
      matchState.batsmanNonStrike = playerId;
    } else {
      matchState.currentBowler = playerId;
    }

    await this.updateMatchState(matchId, matchState);
    return (await this.getMatchById(matchId))!;
  }

  async getMatchAnalytics(matchId: string): Promise<any> {
    const matchBalls = await this.getBallsByMatch(matchId);
    const totalRuns = matchBalls.reduce((sum, ball) => sum + ball.runs, 0);
    const totalWickets = matchBalls.filter(ball => ball.isWicket).length;
    const totalBallsCount = matchBalls.length;
    const overs = Math.floor(totalBallsCount / 6) + (totalBallsCount % 6) / 10;
    const runRate = totalBallsCount > 0 ? (totalRuns / totalBallsCount) * 6 : 0;

    return {
      totalRuns,
      totalWickets,
      totalBalls: totalBallsCount,
      overs,
      runRate,
      boundaries: {
        fours: matchBalls.filter(ball => ball.runs === 4).length,
        sixes: matchBalls.filter(ball => ball.runs === 6).length,
      },
      dotBalls: matchBalls.filter(ball => ball.runs === 0 && !ball.isWicket).length,
      extras: matchBalls.reduce((sum, ball) => sum + (ball.extras || 0), 0),
    };
  }
}
