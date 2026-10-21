import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Game } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { Match } from '../../models/match.model';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { sortByName } from '../../utils/sort.utils';
import { WinnerRingComponent } from '../../components/winner-ring/winner-ring.component';

@Component({
  selector: 'app-matches',
  imports: [RouterLink, FormsModule, DatePipe, CharacterIconComponent, WinnerRingComponent],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css',
})

export class MatchesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  protected matchService = inject(MatchService);

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

    return this.matches()
      .filter(
        (match) =>
          (gameId === null || match.gameId === gameId) &&
          (playerId === null || match.results.some((result) => result.playerId === playerId)),
      )
      .sort((matchA, matchB) => matchB.date.localeCompare(matchA.date));
  });

  hasFilters = computed(() => this.gameFilter() !== null || this.playerFilter() !== null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const gameId = Number(params.get('jogo'));
    const playerId = Number(params.get('jogador'));

    if (gameId) this.gameFilter.set(gameId);
    if (playerId) this.playerFilter.set(playerId);

    this.loadMatches();
  }

  loadMatches(): void {
    this.isLoading.set(true);
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
        this.errorMessage.set('Não foi possível carregar as partidas. Confirme que a API está a correr.');
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.gameFilter.set(null);
    this.playerFilter.set(null);
  }

  getGameName(id: number): string {
    return this.games().find((game) => game.id === id)?.name ?? 'Jogo removido';
  }

  findPlayer(id: number): Player | undefined {
    return this.players().find((player) => player.id === id);
  }
}