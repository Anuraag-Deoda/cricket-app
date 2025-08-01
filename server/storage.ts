import { randomUUID } from "crypto";
import type { 
  InsertTeam, InsertPlayer, InsertMatch, InsertBall, InsertCommentary
} from "@shared/schema";
import type { Team, Player, Match, Ball, AICommentary } from "@shared/types";

export interface IStorage {
  // Teams
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamById(id: string): Promise<Team | undefined>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Players
  getAllPlayers(): Promise<Player[]>;
  getPlayersByTeam(teamId: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayerById(id: string): Promise<Player | undefined>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  updatePlayerForm(playerId: string, formChange: number): Promise<void>;

  // Matches
  getAllMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchById(id: string): Promise<Match | undefined>;
  updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed'): Promise<void>;
  updatePlayerSelection(matchId: string, role: "striker" | "non-striker" | "bowler", playerId: string): Promise<Match>;

  // Balls/Scoring
  addBall(ball: InsertBall): Promise<Ball>;
  getBallsByMatch(matchId: string): Promise<Ball[]>;
  getLastBall(matchId: string): Promise<Ball | undefined>;

  // Commentary
  addCommentary(commentary: InsertCommentary): Promise<AICommentary>;
  getCommentaryByMatch(matchId: string): Promise<AICommentary[]>;

  // Match State
  getMatchState(matchId: string): Promise<any>;
  updateMatchState(matchId: string, state: any): Promise<void>;

  // Analytics
  getMatchAnalytics(matchId: string): Promise<any>;
}


import { DbStorage } from "./storage/db-storage";

// Export singleton instance
export const storage = new DbStorage();
