import { sql } from "drizzle-orm";
import { integer, text, real, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import crypto from "crypto";

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  logo: text("logo"),
  country: text("country"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id").references(() => teams.id),
  name: text("name").notNull(),
  role: text("role", { enum: ["batsman", "bowler", "all-rounder", "keeper"] }).notNull(),
  battingStyle: text("batting_style"),
  bowlingStyle: text("bowling_style"),
  skillRating: integer("skill_rating").default(50),
  formRating: integer("form_rating").default(0),
  battingAverage: real("batting_average").default(0),
  strikeRate: real("strike_rate").default(0),
  bowlingAverage: real("bowling_average").default(0),
  economy: real("economy").default(0),
  fifties: integer("fifties").default(0),
  hundreds: integer("hundreds").default(0),
  wickets: integer("wickets").default(0),
  appearances: integer("appearances").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  team1Id: text("team1_id").references(() => teams.id).notNull(),
  team2Id: text("team2_id").references(() => teams.id).notNull(),
  format: text("format", { enum: ["T20", "ODI", "Test"] }).notNull(),
  oversPerInnings: integer("overs_per_innings").notNull(),
  pitchType: text("pitch_type", { enum: ["green", "flat", "dusty", "turning"] }),
  tossWinnerId: text("toss_winner_id").references(() => teams.id),
  tossDecision: text("toss_decision", { enum: ["bat", "bowl"] }),
  currentInnings: integer("current_innings").default(1),
  status: text("status", { enum: ["upcoming", "live", "completed"] }).default("upcoming"),
  target: integer("target"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const innings = sqliteTable("innings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id").references(() => matches.id).notNull(),
  battingTeamId: text("batting_team_id").references(() => teams.id).notNull(),
  bowlingTeamId: text("bowling_team_id").references(() => teams.id).notNull(),
  inningsNumber: integer("innings_number").notNull(),
  totalRuns: integer("total_runs").default(0),
  totalWickets: integer("total_wickets").default(0),
  totalOvers: real("total_overs").default(0),
  totalBalls: integer("total_balls").default(0),
  extras: integer("extras").default(0),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
});

export const overs = sqliteTable("overs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  inningsId: text("innings_id").references(() => innings.id).notNull(),
  overNumber: integer("over_number").notNull(),
  bowlerId: text("bowler_id").references(() => players.id).notNull(),
  runs: integer("runs").default(0),
  wickets: integer("wickets").default(0),
  extras: integer("extras").default(0),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
});

export const balls = sqliteTable("balls", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id").references(() => matches.id).notNull(),
  overId: text("over_id").references(() => overs.id).notNull(),
  ballNumber: integer("ball_number").notNull(),
  batsmanId: text("batsman_id").references(() => players.id).notNull(),
  bowlerId: text("bowler_id").references(() => players.id).notNull(),
  runs: integer("runs").notNull(),
  extras: integer("extras").default(0),
  extraType: text("extra_type", { enum: ["wide", "no-ball", "bye", "leg-bye"] }),
  isWicket: integer("is_wicket", { mode: "boolean" }).default(false),
  wicketType: text("wicket_type", { enum: ["bowled", "caught", "lbw", "stumped", "run-out", "hit-wicket"] }),
  dismissedPlayerId: text("dismissed_player_id").references(() => players.id),
  commentary: text("commentary"),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const partnerships = sqliteTable("partnerships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  inningsId: text("innings_id").references(() => innings.id).notNull(),
  batsman1Id: text("batsman1_id").references(() => players.id).notNull(),
  batsman2Id: text("batsman2_id").references(() => players.id).notNull(),
  runs: integer("runs").default(0),
  balls: integer("balls").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const aiCommentary = sqliteTable("ai_commentary", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id").references(() => matches.id).notNull(),
  ballId: text("ball_id").references(() => balls.id).notNull(),
  content: text("content").notNull(),
  aiProvider: text("ai_provider", { enum: ["gemini", "gpt4"] }).notNull(),
  tokenUsage: integer("token_usage"),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const matchAwards = sqliteTable("match_awards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id").references(() => matches.id).notNull(),
  playerId: text("player_id").references(() => players.id).notNull(),
  awardType: text("award_type", { enum: ["man_of_match", "best_bowler", "best_batsman"] }).notNull(),
  reasoning: text("reasoning"),
  highlightMoment: text("highlight_moment"),
});

export const matchState = sqliteTable("match_state", {
  matchId: text("match_id").primaryKey().references(() => matches.id),
  state: text("state").notNull(),
});

// Insert schemas
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertBallSchema = createInsertSchema(balls).omit({
  id: true,
  timestamp: true,
}).extend({
  matchId: z.string().min(1, "Match ID is required"),
});

export const insertCommentarySchema = createInsertSchema(aiCommentary).omit({
  id: true,
  timestamp: true,
});

export const insertMatchStateSchema = createInsertSchema(matchState);

// Types
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Innings = typeof innings.$inferSelect;
export type Over = typeof overs.$inferSelect;
export type Ball = typeof balls.$inferSelect;
export type Partnership = typeof partnerships.$inferSelect;
export type AICommentary = typeof aiCommentary.$inferSelect;
export type MatchAward = typeof matchAwards.$inferSelect;
export type MatchState = typeof matchState.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertBall = z.infer<typeof insertBallSchema>;
export type InsertCommentary = z.infer<typeof insertCommentarySchema>;
export type InsertMatchState = z.infer<typeof insertMatchStateSchema>;
