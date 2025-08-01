import { db } from "./db";
import { teams, players, InsertPlayer } from "../shared/schema";
import { eq } from "drizzle-orm";

const playersData: Record<string, Omit<InsertPlayer, "teamId">[]> = {
  "Prashant Super Kings": [
    { name: "Prashant", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 95 },
    { name: "Ashish", role: "keeper", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm spin", skillRating: 89 },
    { name: "Sonal", role: "keeper", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 83 },
    { name: "Vicky", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 88 },
    { name: "Jay", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm fast", skillRating: 84 },
    { name: "Anish", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm spin", skillRating: 79 },
    { name: "Sajeesh", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", skillRating: 82 },
    { name: "Rohan", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm medium", skillRating: 90 },
    { name: "Vivek", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", skillRating: 80 },
    { name: "Sujit", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm spin", skillRating: 85 },
    { name: "Kunal", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm fast", skillRating: 86 },
    { name: "Kashmira", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 81 },
    { name: "Ismail", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 92 },
  ],
  "Anuraag Challengers": [
    { name: "Anuraag", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 95 },
    { name: "Devyesh", role: "keeper", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm medium", skillRating: 88 },
    { name: "Ruzda", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm fast", skillRating: 90 },
    { name: "Harshal", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", skillRating: 82 },
    { name: "Riyaz", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm spin", skillRating: 84 },
    { name: "Suyog", role: "keeper", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm fast", skillRating: 87 },
    { name: "Sandesh", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 79 },
    { name: "Roshan", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm spin", skillRating: 93 },
    { name: "Siddhu", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm spin", skillRating: 78 },
    { name: "Vipul", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm medium", skillRating: 86 },
    { name: "Yash", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm fast", skillRating: 83 },
    { name: "Amaan", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm fast", skillRating: 89 },
    { name: "Anish", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 81 },
  ],
  "Rupesh Giants": [
    { name: "Rupesh", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", skillRating: 95 },
    { name: "Manoj", role: "keeper", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm spin", skillRating: 89 },
    { name: "Mitesh", role: "keeper", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm medium", skillRating: 86 },
    { name: "Pratik", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 90 },
    { name: "PrathameshD", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm fast", skillRating: 82 },
    { name: "Sani", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm fast", skillRating: 80 },
    { name: "Siddhart", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm spin", skillRating: 91 },
    { name: "Aashif", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 84 },
    { name: "Ashok", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", skillRating: 87 },
    { name: "Sushant", role: "all-rounder", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm medium", skillRating: 79 },
    { name: "Venu", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", skillRating: 88 },
    { name: "Ishant", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Left-arm fast", skillRating: 81 },
    { name: "Prathmesh", role: "all-rounder", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm spin", skillRating: 83 },
  ],
};

async function seed() {
  console.log("Seeding database...");

  for (const [teamName, teamPlayers] of Object.entries(playersData)) {
    const [team] = await db.select().from(teams).where(eq(teams.name, teamName));
    if (team) {
      for (const player of teamPlayers) {
        await db.insert(players).values({ ...player, teamId: team.id }).onConflictDoNothing();
      }
    }
  }

  console.log("Seeding complete.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
