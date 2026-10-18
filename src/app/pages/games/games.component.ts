import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { MatchService } from '../../services/match.service';
import { Game, GameCategory, GAME_CATEGORIES } from '../../models/game.model';
import { Match } from '../../models/match.model';
import { GameCardComponent } from '../../components/game-card/game-card.component';

type SortOption = 'name' | 'played' | 'duration';

@Component({
  selector: 'app-games',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [GameCardComponent, RouterLink, FormsModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
})
export class GamesComponent implements OnInit {
  private gameService = inject(GameService);
  private matchService = inject(MatchService);
  private router = inject(Router);

  games: Game[] = [];
  matches: Match[] = [];
  categories = GAME_CATEGORIES;

  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  categoryFilter: GameCategory | '' = '';
  sortBy: SortOption = 'name';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      games: this.gameService.getAll(),
      matches: this.matchService.getAll(),
    }).subscribe({
      next: ({ games, matches }) => {
        this.games = games;
        this.matches = matches;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os jogos. Confirme que a API está a correr.';
        this.isLoading = false;
      },
    });
  }

  timesPlayed(gameId: number): number {
    return this.matches.filter((match) => match.gameId === gameId).length;
  }

  get filteredGames(): Game[] {
    const termSearched = this.searchTerm.trim().toLowerCase();

    const gamesList = this.games.filter(
      (game) =>
        (!this.categoryFilter || game.category === this.categoryFilter) &&
        (!termSearched || game.name.toLowerCase().includes(termSearched)),
    );

    return [...gamesList].sort((gameA, gameB) => {
      if (this.sortBy === 'played') return this.timesPlayed(gameB.id) - this.timesPlayed(gameA.id);
      if (this.sortBy === 'duration') return gameA.duration - gameB.duration;
      return gameA.name.localeCompare(gameB.name, 'pt');
    });
  }

  get hasFilters(): boolean {
    return !!this.searchTerm.trim() || !!this.categoryFilter || this.sortBy !== 'name';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.sortBy = 'name';
  }

  goToGame(id: number): void {
    this.router.navigate(['/jogos', id]);
  }
}