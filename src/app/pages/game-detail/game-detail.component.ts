import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { MatchService } from '../../services/match.service';
import { PlayerService } from '../../services/player.service';
import { Game } from '../../models/game.model';
import { Match, MatchResult } from '../../models/match.model';
import { Player } from '../../models/player.model';
import { PlayerWins } from '../../models/player-stats.model';

@Component({
  selector: 'app-game-detail',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, DatePipe],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.css',
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private matchService = inject(MatchService);
  private playerService = inject(PlayerService);

  game?: Game;
  matches: Match[] = [];
  players: Player[] = [];

  isLoading = true;
  errorMessage = '';

  isConfirmingDelete = false;
  isDeleting = false;
  deleteError = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      game: this.gameService.getById(id),
      matches: this.matchService.getByGame(id),
      players: this.playerService.getAll(),
    }).subscribe({
      next: ({ game, matches, players }) => {
        this.game = game;
        this.matches = [...matches].sort((matchA, matchB) => matchB.date.localeCompare(matchA.date));
        this.players = players;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não encontrámos este jogo. Pode ter sido removido.';
        this.isLoading = false;
      },
    });
  }

  playerName(id: number): string {
    return this.players.find((player) => player.id === id)?.name ?? 'Jogador removido';
  }

  get winsByPlayer(): PlayerWins[] {
    return this.players
      .map((player) => ({
        player,
        wins: this.matches.filter((match) => this.matchService.winnerOf(match) === player.id).length,
      }))
      .filter((player) => player.wins > 0)
      .sort((playerA, playerB) => playerB.wins - playerA.wins);
  }

  get record(): { result: MatchResult; date: string } | null {
    let best: { result: MatchResult; date: string } | null = null;
    for (const match of this.matches) {
      for (const result of match.results) {
        if (!best || result.score > best.result.score) {
          best = { result, date: match.date };
        }
      }
    }
    return best;
  }

  ranked(match: Match): MatchResult[] {
    return [...match.results].sort((playerA, playerB) => playerB.score - playerA.score);
  }

  askDelete(): void {
    this.isConfirmingDelete = true;
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.isConfirmingDelete = false;
  }

  deleteGame(): void {
    if (!this.game) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.gameService.delete(this.game.id).subscribe({
      next: () => this.router.navigate(['/jogos']),
      error: () => {
        this.deleteError = 'Não foi possível remover o jogo. Confirme que a API está a correr.';
        this.isDeleting = false;
      },
    });
  }
}