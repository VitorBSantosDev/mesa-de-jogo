import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Game } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { NewMatch } from '../../models/match.model';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { WinnerRingComponent } from '../../components/winner-ring/winner-ring.component';
import { getTodayIso } from '../../utils/date.utils';

type ResultForm = FormGroup<{
  playerId: FormControl<number>;
  score: FormControl<number | null>;
}>;

@Component({
  selector: 'app-match-new',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CharacterIconComponent, WinnerRingComponent],
  templateUrl: './match-new.component.html',
  styleUrl: './match-new.component.css',
})

export class MatchNewComponent implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private router = inject(Router);

  today = getTodayIso();

  games = signal<Game[]>([]);
  players = signal<Player[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  isSaving = signal(false);
  saveError = signal('');
  submitted = signal(false);

  sortedGames = computed(() =>
    [...this.games()].sort((gameA, gameB) => gameA.name.localeCompare(gameB.name, 'pt')),
  );

  sortedPlayers = computed(() =>
    [...this.players()].sort((playerA, playerB) => playerA.name.localeCompare(playerB.name, 'pt')),
  );

  dateNotInFuture = (control: AbstractControl) => {
    return control.value > this.today ? { future: true } : null;
  };

  playersInRange = (form: AbstractControl) => {
    const { gameId, results } = form.value;
    const playerCount = results.length;
    const game = this.games().find((game) => game.id === gameId);

    if (playerCount < 2) return { notEnoughPlayers: true };
    if (game && (playerCount < game.minPlayers || playerCount > game.maxPlayers)) return { playersRange: true };
    return null;
  };

  noTieForFirst = (form: AbstractControl) => {
    const scores: (number | null)[] = form.value.results.map((result: { score: number | null }) => result.score);
    if (scores.length < 2 || scores.some((score) => score === null)) return null;

    const best = Math.max(...(scores as number[]));
    const playersWithBest = scores.filter((score) => score === best).length;
    return playersWithBest > 1 ? { tie: true } : null;
  };

  form = this.formBuilder.group(
    {
      gameId: [null as number | null, Validators.required],
      date: [this.today, [Validators.required, this.dateNotInFuture]],
      results: this.formBuilder.array<ResultForm>([]),
    },
    { validators: [this.playersInRange, this.noTieForFirst] },
  );

  formValue = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  previewGame = computed(() => this.games().find((game) => game.id === this.formValue().gameId));

  previewResults = computed(() =>
    this.formValue()
      .results.filter((result) => result.score !== null)
      .map((result) => ({ playerId: result.playerId, score: result.score as number }))
      .sort((resultA, resultB) => resultB.score - resultA.score),
  );

  previewWinnerId = computed(() => {
    const filledResults = this.previewResults();
    const allFilled = filledResults.length >= 2 && filledResults.length === this.formValue().results.length;
    const hasTie = filledResults.length >= 2 && filledResults[0].score === filledResults[1].score;
    return allFilled && !hasTie ? filledResults[0].playerId : null;
  });

  get results() {
    return this.form.controls.results;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      games: this.gameService.getAll(),
      players: this.playerService.getAll(),
    }).subscribe({
      next: ({ games, players }) => {
        this.games.set(games);
        this.players.set(players);
        this.form.updateValueAndValidity();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os jogos e jogadores. Confirme que a API está a correr.');
        this.isLoading.set(false);
      },
    });
  }

  createResult(playerId: number): ResultForm {
    return this.formBuilder.group({
      playerId: [playerId],
      score: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    });
  }

  isSelected(playerId: number): boolean {
    return this.results.controls.some((result) => result.controls.playerId.value === playerId);
  }

  togglePlayer(playerId: number): void {
    const index = this.results.controls.findIndex((result) => result.controls.playerId.value === playerId);

    if (index === -1) {
      this.results.push(this.createResult(playerId));
    } else {
      this.results.removeAt(index);
    }
  }

  findPlayer(id: number): Player | undefined {
    return this.players().find((player) => player.id === id);
  }

  getSelectedGame(): Game | undefined {
    return this.games().find((game) => game.id === this.form.controls.gameId.value);
  }

  showError(field: 'gameId' | 'date', error: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
  }

  showPlayersError(error: string): boolean {
    return (this.submitted() || this.results.length > 0) && this.form.hasError(error);
  }

  showScoreError(error: string): boolean {
    return this.results.controls.some(
      (result) => result.controls.score.touched && result.controls.score.hasError(error),
    );
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const newMatch: NewMatch = {
      gameId: values.gameId as number,
      date: values.date,
      results: values.results.map((result) => ({
        playerId: result.playerId,
        score: Number(result.score),
      })),
    };

    this.isSaving.set(true);
    this.saveError.set('');

    this.matchService.create(newMatch).subscribe({
      next: () => this.router.navigate(['/partidas']),
      error: () => {
        this.saveError.set('Não foi possível guardar a partida. Confirme que a API está a correr.');
        this.isSaving.set(false);
      },
    });
  }
}