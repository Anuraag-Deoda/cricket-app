import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Match, BallDetails } from '@shared/types';

interface AppState {
  match: Match | null;
  setMatch: (match: Match) => void;
  processBall: (ball: BallDetails) => Promise<void>;
  setPlayer: (
    matchId: string,
    role: "striker" | "non-striker" | "bowler",
    playerId: string
  ) => Promise<void>;
}

export const useCricketStore = create<AppState>()(
  persist(
    (set, get) => ({
      match: null,
      setMatch: (match) => set({ match }),
      processBall: async (ball) => {
        const match = get().match;
        if (!match) return;

        const response = await fetch(`/api/matches/${match.id}/process-ball`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ball),
        });

        if (response.ok) {
          const updatedMatch = await response.json();
          set({ match: updatedMatch });
        }
      },
      setPlayer: async (matchId, role, playerId) => {
        const response = await fetch(
          `/api/matches/${matchId}/select-player`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, playerId }),
          }
        );

        if (response.ok) {
          const updatedMatch = await response.json();
          set({ match: updatedMatch });
        }
      },
    }),
    {
      name: 'cricket-companion-storage',
    }
  )
);
