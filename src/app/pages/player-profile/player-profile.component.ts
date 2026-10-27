import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { GameService } from '../../services/game.service';
import { MatchService } from '../../services/match.service';
import { RealtimeService } from '../../services/realtime.service';
import { Player } from '../../models/player.model';
import { Game } from '../../models/game.model';
import { Match } from '../../models/match.model';
import { getCharacterName } from '../../models/characters.model';
import { findById } from '../../utils/find.utils';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';

const RECENT_MATCHES = 5;

interface GameRecord {
  game: Game;
  played: number;
  wins: number;
  winRate: number;
}

interface Rivalry {
  opponent: Player;
  together: number;
  ahead: number;
  behind: number;
}

@Component({
  selector: 'app-player-profile',
  imports: [RouterLink, CharacterIconComponent, MatchCardComponent],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css',
})
export class PlayerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);
  private gameService = inject(GameService);
  private matchService = inject(MatchService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  recentMatches = RECENT_MATCHES;

  playerId = signal(0);
  players = signal<Player[]>([]);
  games = signal<Game[]>([]);
  matches = signal<Match[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  player = computed(() => findById(this.players(), this.playerId()));

  characterName = computed(() => {
    const player = this.player();
    return player ? getCharacterName(player.avatar) : '';
  });

  playerMatches = computed(() =>
    this.matches()
      .filter((match) => match.results.some((result) => result.playerId === this.playerId()))
      .sort((matchA, matchB) => matchB.date.localeCompare(matchA.date)),
  );

  wins = computed(() => this.playerMatches().filter((match) => this.hasWon(match)).length);

  winRate = computed(() => {
    const played = this.playerMatches().length;
    return played ? Math.round((this.wins() / played) * 100) : 0;
  });

  bestScore = computed(() => {
    const scores = this.playerMatches().flatMap((match) =>
      match.results.filter((result) => result.playerId === this.playerId()).map((result) => result.score),
    );
    return scores.length ? Math.max(...scores) : null;
  });

  recentWins = computed(() => this.playerMatches().slice(0, RECENT_MATCHES).map((match) => this.hasWon(match)));

  gameRecords = computed<GameRecord[]>(() =>
    this.games()
      .map((game) => {
        const gameMatches = this.playerMatches().filter((match) => match.gameId === game.id);
        const wins = gameMatches.filter((match) => this.hasWon(match)).length;
        const played = gameMatches.length;
        return { game, played, wins, winRate: played ? Math.round((wins / played) * 100) : 0 };
      })
      .filter((record) => record.played > 0)
      .sort((recordA, recordB) => recordB.played - recordA.played || recordB.wins - recordA.wins),
  );

  rivalries = computed<Rivalry[]>(() =>
    this.players()
      .filter((opponent) => opponent.id !== this.playerId())
      .map((opponent) => {
        let ahead = 0;
        let behind = 0;
        let together = 0;

        for (const match of this.playerMatches()) {
          const myResult = match.results.find((result) => result.playerId === this.playerId());
          const theirResult = match.results.find((result) => result.playerId === opponent.id);
          if (!myResult || !theirResult) continue;

          together++;
          if (myResult.score > theirResult.score) ahead++;
          if (myResult.score < theirResult.score) behind++;
        }

        return { opponent, together, ahead, behind };
      })
      .filter((rivalry) => rivalry.together > 0)
      .sort((rivalryA, rivalryB) => rivalryB.together - rivalryA.together),
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.playerId.set(Number(params.get('id'))));

    this.loadProfile();
    this.realtimeService
      .watch('players', 'games', 'matches', 'match_results')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadProfile(false));
  }

  loadProfile(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      players: this.playerService.getAll(),
      games: this.gameService.getAll(),
      matches: this.matchService.getAll(),
    }).subscribe({
      next: ({ players, games, matches }) => {
        this.players.set(players);
        this.games.set(games);
        this.matches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar o perfil. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  hasWon(match: Match): boolean {
    return this.matchService.getWinnerId(match) === this.playerId();
  }

  getGameName(id: number): string {
    return findById(this.games(), id)?.name ?? 'Jogo removido';
  }
}