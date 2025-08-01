import { useCricketStore } from "@/store/cricket-store";

export default function LiveScoreBar() {
  const { match, teams } = useCricketStore();
  
  const team1 = teams.find(t => t.id === match.currentMatch?.team1Id);
  const team2 = teams.find(t => t.id === match.currentMatch?.team2Id);

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-cricket-primary to-green-400 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">
              <span>{team1?.name || 'Team 1'}</span> vs <span>{team2?.name || 'Team 2'}</span>
            </div>
            <div className="bg-white/20 px-2 py-1 rounded text-xs">
              <span>{match.currentMatch?.format || 'T20'}</span> • Over {match.score.overs.toFixed(1)}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="font-source-code text-lg font-semibold">
                <span>{match.score.runs}</span>/<span>{match.score.wickets}</span>
              </div>
              <div className="text-xs opacity-90">
                RR: <span>{match.score.runRate.toFixed(1)}</span>
                {match.score.requiredRate && (
                  <> | RRR: <span>{match.score.requiredRate.toFixed(1)}</span></>
                )}
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors">
              <i className="fas fa-play mr-1"></i> Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
