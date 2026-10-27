import { Player } from './player.model';

export interface PlayerWins {
  player: Player;
  wins: number;
}

export interface PlayerStats {
  played: number;
  wins: number;
  winRate: number;
}

export interface PlayerStanding extends PlayerWins, PlayerStats {}