import { Match, MatchResult } from '../models/match.model';
import { PlayerStats } from '../models/player-stats.model';

export function calculateWinRate(wins: number, played: number): number {
  return played ? Math.round((wins / played) * 100) : 0;
}

export function getWinnerId(match: Match): number {
  const best = match.results.reduce((playerA, playerB) => (playerB.score > playerA.score ? playerB : playerA));
  return best.playerId;
}

export function isWinner(match: Match, playerId: number): boolean {
  return getWinnerId(match) === playerId;
}

export function sortByScore(match: Match): MatchResult[] {
  return [...match.results].sort((resultA, resultB) => resultB.score - resultA.score);
}

export function sortByDateDesc(matches: Match[]): Match[] {
  return [...matches].sort((matchA, matchB) => matchB.date.localeCompare(matchA.date));
}

export function getMatchesOfPlayer(matches: Match[], playerId: number): Match[] {
  return matches.filter((match) => match.results.some((result) => result.playerId === playerId));
}

export function countWins(matches: Match[], playerId: number): number {
  return matches.filter((match) => isWinner(match, playerId)).length;
}

export function getPlayerStats(matches: Match[], playerId: number): PlayerStats {
  const playerMatches = getMatchesOfPlayer(matches, playerId);
  const wins = countWins(playerMatches, playerId);
  return { played: playerMatches.length, wins, winRate: calculateWinRate(wins, playerMatches.length) };
}