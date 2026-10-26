import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { MatchService } from '../../services/match.service';
import { PlayerService } from '../../services/player.service';
import { AuthService } from '../../services/auth.service';
import { Game } from '../../models/game.model';
import { Match, MatchResult } from '../../models/match.model';
import { Player } from '../../models/player.model';
import { PlayerWins } from '../../models/player-stats.model';
import { findById } from '../../utils/find.utils';
import { MatchCardComponent } from '../../components/match-card/match-card.component';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink, DatePipe, MatchCardComponent],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.css',
})

export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private matchService = inject(MatchService);
  private playerService = inject(PlayerService);
  protected authService = inject(AuthService);

  game = signal<Game | undefined>(undefined);
  matches = signal<Match[]>([]);
  players = signal<Player[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  isConfirmingDelete = signal(false);
  isDeleting = signal(false);
  deleteError = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      game: this.gameService.getById(id),
      matches: this.matchService.getByGame(id),
      players: this.playerService.getAll(),
    }).subscribe({
      next: ({ game, matches, players }) => {
        this.game.set(game);
        this.matches.set([...matches].sort((matchA, matchB) => matchB.date.localeCompare(matchA.date)));
        this.players.set(players);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não encontrámos este jogo. Pode ter sido removido.');
        this.isLoading.set(false);
      },
    });
  }

  getPlayerName(id: number): string {
    return findById(this.players(), id)?.name ?? 'Jogador removido';
  }

  winsByPlayer = computed<PlayerWins[]>(() =>
    this.players()
      .map((player) => ({
        player,
        wins: this.matches().filter((match) => this.matchService.getWinnerId(match) === player.id).length,
      }))
      .filter((player) => player.wins > 0)
      .sort((playerA, playerB) => playerB.wins - playerA.wins),
  );

  record = computed(() => {
    let best: { result: MatchResult; date: string } | null = null;
    for (const match of this.matches()) {
      for (const result of match.results) {
        if (!best || result.score > best.result.score) {
          best = { result, date: match.date };
        }
      }
    }
    return best;
  });

  askDelete(): void {
    this.isConfirmingDelete.set(true);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  deleteGame(): void {
    const game = this.game();
    if (!game) return;

    this.isDeleting.set(true);
    this.deleteError.set('');

    this.gameService.delete(game.id).subscribe({
      next: () => this.router.navigate(['/jogos']),
      error: () => {
        this.deleteError.set('Não foi possível remover o jogo. Verifique a ligação e tente novamente.');
        this.isDeleting.set(false);
      },
    });
  }
}