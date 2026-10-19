import { Player } from './player.model';

export interface PlayerWins {
  player: Player;
  wins: number;
}

export interface PlayerStanding extends PlayerWins {
  played: number;
  winRate: number;
}