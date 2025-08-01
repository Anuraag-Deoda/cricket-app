import type { Match, Player } from '../shared/types';

export class RulesEngine {
  private match: Match;

  constructor(match: Match) {
    this.match = match;
  }

  public validate(): (string | null)[] {
    const errors = [
      this.validateBowlerNotBowlingConsecutiveOvers(),
      this.validateMaxOversPerBowler(),
      this.validateNoDismissedBatsmen(),
      this.validateInningsCompletion(),
    ];
    return errors.filter(e => e !== null);
  }

  private validateBowlerNotBowlingConsecutiveOvers(): string | null {
    const innings = this.match.innings[this.match.currentInnings - 1];
    if (innings.timeline.length < 6) return null;

    const lastOverBowlerId = innings.timeline[innings.timeline.length - 6]?.bowlerId;
    if (innings.currentBowler === lastOverBowlerId.toString()) {
      return "The same bowler cannot bowl consecutive overs.";
    }
    return null;
  }

  private validateMaxOversPerBowler(): string | null {
    const innings = this.match.innings[this.match.currentInnings - 1];
    const bowler = innings.bowlingTeam.players.find(p => p.id === innings.currentBowler);
    if (!bowler) return null;

    const maxOvers = this.match.oversPerInnings / 5;
    if (bowler.bowling.ballsBowled / 6 >= maxOvers) {
      return `${bowler.name} has already bowled their maximum of ${maxOvers} overs.`;
    }
    return null;
  }

  private validateNoDismissedBatsmen(): string | null {
    const innings = this.match.innings[this.match.currentInnings - 1];
    const onStrike = innings.battingTeam.players.find(p => p.id === innings.batsmanOnStrike);
    const nonStrike = innings.battingTeam.players.find(p => p.id === innings.batsmanNonStrike);

    if (onStrike?.batting.status === 'out' || nonStrike?.batting.status === 'out') {
      return "A dismissed batsman cannot be selected.";
    }
    return null;
  }

  private validateInningsCompletion(): string | null {
    const innings = this.match.innings[this.match.currentInnings - 1];
    if (innings.wickets >= 10 || innings.overs >= this.match.oversPerInnings) {
      return "The innings is already complete.";
    }
    return null;
  }
}
