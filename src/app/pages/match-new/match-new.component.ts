import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { forkJoin, map, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { Game } from '../../models/game.model';
import { Player } from '../../models/player.model';
import { Match, NewMatch } from '../../models/match.model';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { WinnerRingComponent } from '../../components/winner-ring/winner-ring.component';
import { getTodayIso } from '../../utils/date.utils';
import { sortByName } from '../../utils/sort.utils';
import { findById } from '../../utils/find.utils';
import { DigitsOnlyDirective } from '../../directives/digits-only.directive';

type ResultForm = FormGroup<{
  playerId: FormControl<number>;
  score: FormControl<number | null>;
}>;

@Component({
  selector: 'app-match-new',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CharacterIconComponent, WinnerRingComponent, DigitsOnlyDirective],
  templateUrl: './match-new.component.html',
  styleUrl: './match-new.component.css',
})

export class MatchNewComponent implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);
  private gameService = inject(GameService);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  today = getTodayIso();

  games = signal<Game[]>([]);
  players = signal<Player[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  editingId = signal<number | null>(null);

  isSaving = signal(false);
  saveError = signal('');
  submitted = signal(false);

  isConfirmingDelete = signal(false);
  isDeleting = signal(false);
  deleteError = signal('');

  sortedGames = computed(() => sortByName(this.games()));

  sortedPlayers = computed(() => sortByName(this.players()));

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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.editingId.set(id);

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const editingId = this.editingId();

    forkJoin({
      games: this.gameService.getAll(),
      players: this.playerService.getAll(),
      match: editingId === null ? of(null) : this.matchService.getById(editingId),
    }).subscribe({
      next: ({ games, players, match }) => {
        this.games.set(games);
        this.players.set(players);
        if (match) this.fillForm(match);
        this.form.updateValueAndValidity();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  private fillForm(match: Match): void {
    this.form.patchValue({ gameId: match.gameId, date: match.date });
    this.results.clear();

    for (const result of match.results) {
      const resultForm = this.createResult(result.playerId);
      resultForm.controls.score.setValue(result.score);
      this.results.push(resultForm);
    }
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
    return findById(this.players(), id);
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

    const editingId = this.editingId();
    const request = editingId === null ? this.matchService.create(newMatch) : this.matchService.update(editingId, newMatch);

    this.isSaving.set(true);
    this.saveError.set('');

    request.subscribe({
      next: () => this.router.navigate(['/partidas']),
      error: () => {
        this.saveError.set('Não foi possível guardar a partida. Verifique a ligação e tente novamente.');
        this.isSaving.set(false);
      },
    });
  }

  askDelete(): void {
    this.isConfirmingDelete.set(true);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  deleteMatch(): void {
    const editingId = this.editingId();
    if (editingId === null) return;

    this.isDeleting.set(true);
    this.deleteError.set('');

    this.matchService.delete(editingId).subscribe({
      next: () => this.router.navigate(['/partidas']),
      error: () => {
        this.deleteError.set('Não foi possível eliminar a partida. Verifique a ligação e tente novamente.');
        this.isDeleting.set(false);
      },
    });
  }
}