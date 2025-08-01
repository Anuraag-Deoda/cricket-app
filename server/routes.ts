import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertTeamSchema, insertPlayerSchema, insertMatchSchema, insertBallSchema } from "@shared/schema";
import { generateCricketCommentary } from "./services/gemini";
import { processBall } from "./cricket-logic";
import { RulesEngine } from "./rules-engine";

export async function registerRoutes(app: Express): Promise<Server> {
  // Teams endpoints
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      console.error('Team creation error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid team data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create team" });
      }
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const teamData = insertTeamSchema.partial().parse(req.body);
      const updatedTeam = await storage.updateTeam(id, teamData);
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(updatedTeam);
    } catch (error) {
      console.error('Team update error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid team data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update team" });
      }
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTeam(id);
      if (!success) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error('Team deletion error:', error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Players endpoints
  app.get("/api/players", async (req, res) => {
    try {
      const teamId = req.query.teamId as string;
      const players = teamId 
        ? await storage.getPlayersByTeam(teamId)
        : await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid player data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create player" });
      }
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const playerData = insertPlayerSchema.partial().parse(req.body);
      const updatedPlayer = await storage.updatePlayer(id, playerData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(updatedPlayer);
    } catch (error) {
      console.error('Player update error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid player data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update player" });
      }
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePlayer(id);
      if (!success) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error('Player deletion error:', error);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // Individual team endpoints
  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeamById(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Matches endpoints
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });



  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid match data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create match" });
      }
    }
  });

  app.get("/api/matches/:matchId", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.matchId);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  app.post("/api/matches/:matchId/process-ball", async (req, res) => {
    try {
      const match = await storage.getMatchById(req.params.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      const rulesEngine = new RulesEngine(match);
      const errors = rulesEngine.validate();
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid action", errors });
      }

      const updatedMatch = processBall(match, req.body);
      if (!updatedMatch) {
        return res.status(500).json({ message: "Failed to process ball" });
      }

      await storage.updateMatchState(req.params.matchId, updatedMatch.innings[updatedMatch.currentInnings - 1]);
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to process ball" });
    }
  });

  app.post("/api/matches/:matchId/select-player", async (req, res) => {
    try {
      const { matchId } = req.params;
      const { role, playerId } = req.body;
      const updatedMatch = await storage.updatePlayerSelection(matchId, role, playerId);
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ message: "Failed to select player" });
    }
  });

  // Balls/Scoring endpoints
  app.post("/api/balls", async (req, res) => {
    try {
      const ballData = insertBallSchema.parse(req.body);
      const ball = await storage.addBall(ballData);
      res.status(201).json(ball);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid ball data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to record ball" });
      }
    }
  });

  app.get("/api/matches/:matchId/balls", async (req, res) => {
    try {
      const balls = await storage.getBallsByMatch(req.params.matchId);
      res.json(balls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balls" });
    }
  });

  // Commentary endpoints
  app.post("/api/commentary/generate", async (req, res) => {
    try {
      const { runs, isWicket, batsmanName, bowlerName, context } = req.body;
      
      const commentary = await generateCricketCommentary({
        runs,
        isWicket,
        batsmanName: batsmanName || "Batsman",
        bowlerName: bowlerName || "Bowler",
        context: context || "live match"
      });

      // Store commentary in database
      await storage.addCommentary({
        matchId: req.body.matchId || "",
        ballId: req.body.ballId || "",
        content: commentary,
        aiProvider: 'gemini'
      });

      res.json({ commentary });
    } catch (error) {
      console.error("Commentary generation failed:", error);
      res.status(500).json({ message: "Failed to generate commentary" });
    }
  });

  // Match state endpoints
  app.get("/api/matches/:matchId/state", async (req, res) => {
    try {
      const state = await storage.getMatchState(req.params.matchId);
      res.json(state);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match state" });
    }
  });

  app.put("/api/matches/:matchId/state", async (req, res) => {
    try {
      await storage.updateMatchState(req.params.matchId, req.body);
      res.json({ message: "Match state updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update match state" });
    }
  });

  // Analytics endpoints
  app.get("/api/matches/:matchId/analytics", async (req, res) => {
    try {
      const analytics = await storage.getMatchAnalytics(req.params.matchId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
