import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { Game, GameCategory, GAME_CATEGORIES } from '../../models/game.model';
import { Match } from '../../models/match.model';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';

type SortOption = 'name' | 'played' | 'duration';

@Component({
  selector: 'app-games',
  imports: [GameCardComponent, RouterLink, FormsModule, FilterPanelComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
})
export class GamesComponent implements OnInit {
  private gameService = inject(GameService);
  private matchService = inject(MatchService);
  private router = inject(Router);
  protected authService = inject(AuthService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  categories = GAME_CATEGORIES;

  games = signal<Game[]>([]);
  matches = signal<Match[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  searchTerm = signal('');
  categoryFilter = signal<GameCategory | ''>('');
  sortBy = signal<SortOption>('name');

  ngOnInit(): void {
    this.loadGames();
    this.realtimeService
      .watch('games', 'matches')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadGames(false));
  }

  loadGames(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      games: this.gameService.getAll(),
      matches: this.matchService.getAll(),
    }).subscribe({
      next: ({ games, matches }) => {
        this.games.set(games);
        this.matches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os jogos. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  countMatches(gameId: number): number {
    return this.matches().filter((match) => match.gameId === gameId).length;
  }

  filteredGames = computed(() => {
    const termSearched = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    const sortBy = this.sortBy();

    const gamesList = this.games().filter(
      (game) =>
        (!category || game.category === category) &&
        (!termSearched || game.name.toLowerCase().includes(termSearched)),
    );

    return [...gamesList].sort((gameA, gameB) => {
      if (sortBy === 'played') return this.countMatches(gameB.id) - this.countMatches(gameA.id);
      if (sortBy === 'duration') return gameA.duration - gameB.duration;
      return gameA.name.localeCompare(gameB.name, 'pt');
    });
  });

  hasFilters = computed(
    () => !!this.searchTerm().trim() || !!this.categoryFilter() || this.sortBy() !== 'name',
  );

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('');
    this.sortBy.set('name');
  }

  goToGame(id: number): void {
    this.router.navigate(['/jogos', id]);
  }
}