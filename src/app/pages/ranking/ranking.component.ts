import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Game } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { Match } from '../../models/match.model';
import { PlayerStanding } from '../../models/player-stats.model';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { sortByName } from '../../utils/sort.utils';

const MIN_MATCHES_FOR_RATE = 3;
const RECENT_MATCHES = 5;

interface RankingRow extends PlayerStanding {
  recentWins: boolean[];
}

interface GameChampion {
  game: Game;
  player: Player | null;
  wins: number;
  isTie: boolean;
}

@Component({
  selector: 'app-ranking',
  imports: [RouterLink, CharacterIconComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css',
})

export class RankingComponent implements OnInit {
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);

  minMatchesForRate = MIN_MATCHES_FOR_RATE;
  recentMatches = RECENT_MATCHES;

  games = signal<Game[]>([]);
  players = signal<Player[]>([]);
  matches = signal<Match[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  ranking = computed<RankingRow[]>(() => {
    const matchesByDate = [...this.matches()].sort((matchA, matchB) => matchB.date.localeCompare(matchA.date));

    return this.players()
      .map((player) => {
        const playerMatches = matchesByDate.filter((match) =>
          match.results.some((result) => result.playerId === player.id),
        );
        const results = playerMatches.map((match) => this.matchService.getWinnerId(match) === player.id);
        const wins = results.filter((won) => won).length;
        const played = playerMatches.length;

        return {
          player,
          wins,
          played,
          winRate: played ? Math.round((wins / played) * 100) : 0,
          recentWins: results.slice(0, RECENT_MATCHES),
        };
      })
      .sort(
        (rowA, rowB) =>
          rowB.wins - rowA.wins ||
          rowB.winRate - rowA.winRate ||
          rowA.player.name.localeCompare(rowB.player.name, 'pt'),
      );
  });

  mostPlayedGame = computed(() => {
    const gameCount = this.games().map((game) => ({
      game,
      count: this.matches().filter((match) => match.gameId === game.id).length,
    }));
    const topGames = gameCount.sort((countA, countB) => countB.count - countA.count)[0];
    return topGames && topGames.count > 0 ? topGames : null;
  });

  bestWinRate = computed(() => {
    const candidates = this.ranking().filter((row) => row.played >= MIN_MATCHES_FOR_RATE);
    return [...candidates].sort((rowA, rowB) => rowB.winRate - rowA.winRate || rowB.wins - rowA.wins)[0] ?? null;
  });

  gameChampions = computed<GameChampion[]>(() =>
    sortByName(this.games()).map((game) => {
      const winsByPlayer = new Map<number, number>();

      for (const match of this.matches()) {
        if (match.gameId !== game.id) continue;
        const winnerId = this.matchService.getWinnerId(match);
        winsByPlayer.set(winnerId, (winsByPlayer.get(winnerId) ?? 0) + 1);
      }

      if (winsByPlayer.size === 0) {
        return { game, player: null, wins: 0, isTie: false };
      }

      const bestWins = Math.max(...winsByPlayer.values());
      const leaders = [...winsByPlayer].filter(([, wins]) => wins === bestWins);
      const isTie = leaders.length > 1;

      return {
        game,
        player: isTie ? null : (this.findPlayer(leaders[0][0]) ?? null),
        wins: bestWins,
        isTie,
      };
    }),
  );

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
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
        this.errorMessage.set('Não foi possível carregar a classificação. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  findPlayer(id: number): Player | undefined {
    return this.players().find((player) => player.id === id);
  }

}