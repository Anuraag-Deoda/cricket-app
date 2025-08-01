export enum MatchType {
  T20 = 'T20',
  FiftyOvers = '50-overs',
  TenOvers = '10-overs',
  FiveOvers = '5-overs',
  TwoOvers = '2-overs',
}

export enum PlayerRole {
  Batsman = 'Batsman',
  Bowler = 'Bowler',
  AllRounder = 'All-Rounder',
  WicketKeeper = 'Wicket-Keeper',
}

export enum BowlingStyle {
  RightArmFast = 'Right-arm Fast',
  RightArmMedium = 'Right-arm Medium',
  LeftArmFast = 'Left-arm Fast',
  LeftArmMedium = 'Left-arm Medium',
  OffSpin = 'Off Spin',
  LegSpin = 'Leg Spin',
  SlowLeftArmOrthodox = 'Slow Left-arm Orthodox',
  SlowLeftArmUnorthodox = 'Slow Left-arm Unorthodox',
}

export interface MatchSettings {
  teamNames: [string, string];
  oversPerInnings: number;
  toss: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  matchType: MatchType;
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  isSubstitute: boolean;
  isImpactPlayer: boolean;
  role?: PlayerRole;
  bowlingStyle?: BowlingStyle;
  batting: {
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    status: 'did not bat' | 'not out' | 'out';
    strikeRate: number;
    outDetails?: string;
  };
  bowling: {
    ballsBowled: number;
    runsConceded: number;
    maidens: number;
    wickets: number;
    economyRate: number;
  };
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  impactPlayerUsed: boolean;
}

export interface Ball {
  event: 'run' | 'w' | 'wd' | 'nb' | 'lb' | 'b';
  runs: number;
  extras: number;
  isWicket: boolean;
  wicketType?: string;
  fielderId?: string;
  batsmanId: string;
  bowlerId: string;
  display: string;
  over: number;
}

export interface FallOfWicket {
  wicket: number;
  score: number;
  over: number;
  playerOut: string;
}

export interface Partnership {
  batsman1: string;
  batsman2: string;
  runs: number;
  balls: number;
}

export interface FielderPlacement {
  position: string;
  playerId: string;
}

export interface Innings {
  battingTeam: Team;
  bowlingTeam: Team;
  score: number;
  wickets: number;
  overs: number;
  ballsThisOver: number;
  timeline: Ball[];
  fallOfWickets: FallOfWicket[];
  currentPartnership: Partnership;
  batsmanOnStrike: string;
  batsmanNonStrike: string;
  currentBowler: string;
  fieldPlacements: FielderPlacement[];
  isFreeHit: boolean;
}

export interface SuperOver {
  innings: Innings[];
  currentInnings: 1 | 2;
}

export interface Match {
  id: string;
  teams: [Team, Team];
  oversPerInnings: number;
  toss: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  innings: Innings[];
  currentInnings: 1 | 2;
  status: 'inprogress' | 'finished' | 'superover';
  result?: string;
  superOver?: SuperOver;
  matchType: MatchType;
}

export interface BallDetails {
  event: 'run' | 'w' | 'wd' | 'nb' | 'lb' | 'b';
  runs: number;
  extras: number;
  wicketType?: string;
  fielderId?: string;
}

export interface MatchSituation {
  innings: number;
  battingTeamName: string;
  bowlingTeamName: string;
  oversLeft: number;
  isChasing: boolean;
  target?: number;
  runsNeeded?: number;
  ballsRemaining?: number;
}

export interface AICommentary {
  id: string;
  matchId: string;
  commentary: string;
  timestamp: Date;
}
