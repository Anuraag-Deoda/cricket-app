import type { Match, MatchSituation, MatchType } from "@shared/types";

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
    case 'T20':
      return 6;
    case '50-overs':
      return 10;
    case '10-overs':
      return 3;
    case '5-overs':
      return 1;
    case '2-overs':
      return 1;
    default:
      return 0;
  }
}
