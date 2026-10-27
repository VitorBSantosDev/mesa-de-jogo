import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Game } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { Match } from '../../models/match.model';
import { sortByName } from '../../utils/sort.utils';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { findById } from '../../utils/find.utils';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';


@Component({
  selector: 'app-matches',
  imports: [FormsModule, MatchCardComponent, FilterPanelComponent],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css',
})

export class MatchesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  games = signal<Game[]>([]);
  players = signal<Player[]>([]);
  matches = signal<Match[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  gameFilter = signal<number | null>(null);
  playerFilter = signal<number | null>(null);

  sortedGames = computed(() => sortByName(this.games()));

  sortedPlayers = computed(() => sortByName(this.players()));

  filteredMatches = computed(() => {
    const gameId = this.gameFilter();
    const playerId = this.playerFilter();

    const filtered = this.matches().filter(
      (match) =>
        (gameId === null || match.gameId === gameId) &&
        (playerId === null || match.results.some((result) => result.playerId === playerId)),
    );

    return this.matchService.sortByDateDesc(filtered);
  });

  hasFilters = computed(() => this.gameFilter() !== null || this.playerFilter() !== null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const gameId = Number(params.get('jogo'));
    const playerId = Number(params.get('jogador'));

    if (gameId) this.gameFilter.set(gameId);
    if (playerId) this.playerFilter.set(playerId);

    this.loadMatches();
    this.realtimeService
      .watch('games', 'players', 'matches', 'match_results')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMatches(false));
  }

  loadMatches(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      games: this.gameService.getAll(),
      players: this.playerService.getAll(),
      matches: this.matchService.getAll(),
    }).subscribe({
      next: ({ games, players, matches }) => {
        this.games.set(games);
        this.players.set(players);
        this.matches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as partidas. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.gameFilter.set(null);
    this.playerFilter.set(null);
  }

  getGameName(id: number): string {
    return findById(this.games(), id)?.name ?? 'Jogo removido';
  }
}