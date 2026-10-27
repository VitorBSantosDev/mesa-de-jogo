import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { Player, PlayerAvatar } from '../../models/player.model';
import { Match } from '../../models/match.model';
import { PlayerStanding } from '../../models/player-stats.model';
import { CHARACTERS, getCharacterName } from '../../models/characters.model';
import { CharacterIconComponent } from '../../components/character-icon/character-icon.component';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';

@Component({
  selector: 'app-players',
  imports: [ReactiveFormsModule, RouterLink, CharacterIconComponent, BattleSceneComponent],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css',
})

export class PlayersComponent implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  getCharacterName = getCharacterName;
  maxPlayers = CHARACTERS.length;

  players = signal<Player[]>([]);
  matches = signal<Match[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  isSaving = signal(false);
  saveError = signal('');

  editingId = signal<number | null>(null);

  confirmingDeleteId = signal<number | null>(null);
  isDeleting = signal(false);
  deleteError = signal('');

  nameIsUnique = (control: AbstractControl) => {
    const name = control.value.trim().toLowerCase();
    const exists = this.players().some(
      (player) => player.id !== this.editingId() && player.name.toLowerCase() === name,
    );
    return exists ? { duplicate: true } : null;
  };

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.nameIsUnique]],
    avatar: ['' as PlayerAvatar | '', Validators.required],
  });

  availableCharacters = computed(() => {
    const used = this.players()
      .filter((player) => player.id !== this.editingId())
      .map((player) => player.avatar);
    return CHARACTERS.filter((character) => !used.includes(character.avatar));
  });

  standings = computed<PlayerStanding[]>(() =>
    this.players()
      .map((player) => {
        const playerMatches = this.matches().filter((match) =>
          match.results.some((result) => result.playerId === player.id),
        );
        const wins = playerMatches.filter((match) => this.matchService.getWinnerId(match) === player.id).length;
        const played = playerMatches.length;
        return { player, wins, played, winRate: played ? Math.round((wins / played) * 100) : 0 };
      })
      .sort((standingA, standingB) => standingA.player.name.localeCompare(standingB.player.name, 'pt')),
  );

  ngOnInit(): void {
    this.loadPlayers();
    this.realtimeService
      .watch('players', 'matches', 'match_results')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPlayers(false));
  }

  loadPlayers(showLoading = true): void {
    if (showLoading) this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      players: this.playerService.getAll(),
      matches: this.matchService.getAll(),
    }).subscribe({
      next: ({ players, matches }) => {
        this.players.set(players);
        this.matches.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os jogadores. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  showError(field: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
  }

  startEdit(player: Player): void {
    this.editingId.set(player.id);
    this.form.setValue({ name: player.name, avatar: player.avatar });
    this.saveError.set('');
    this.cancelDelete();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
    this.saveError.set('');
  }

  savePlayer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const player = { name: values.name.trim(), avatar: values.avatar as PlayerAvatar };
    const editingId = this.editingId();

    this.isSaving.set(true);
    this.saveError.set('');

    if (editingId === null) {
      this.playerService.create(player).subscribe({
        next: (created) => {
          this.toastService.show('Jogador adicionado.');
          this.players.update((players) => [...players, created]);
          this.form.reset();
          this.isSaving.set(false);
        },
        error: () => {
          this.saveError.set('Não foi possível adicionar o jogador. Verifique a ligação e tente novamente.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.playerService.update(editingId, player).subscribe({
        next: (updated) => {
          this.toastService.show('Alterações ao jogador guardadas.');
          this.players.update((players) => players.map((item) => (item.id === updated.id ? updated : item)));
          this.cancelEdit();
          this.isSaving.set(false);
        },
        error: () => {
          this.saveError.set('Não foi possível guardar as alterações. Verifique a ligação e tente novamente.');
          this.isSaving.set(false);
        },
      });
    }
  }

  askDelete(id: number): void {
    this.confirmingDeleteId.set(id);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  deletePlayer(id: number): void {
    this.isDeleting.set(true);
    this.deleteError.set('');

    this.playerService.delete(id).subscribe({
      next: () => {
        this.toastService.show('Jogador removido.');
        this.players.update((players) => players.filter((player) => player.id !== id));
        this.confirmingDeleteId.set(null);
        this.isDeleting.set(false);
      },
      error: () => {
        this.deleteError.set('Não foi possível remover o jogador. Verifique a ligação e tente novamente.');
        this.isDeleting.set(false);
      },
    });
  }
}