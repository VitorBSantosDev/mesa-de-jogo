import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GameService } from '../../services/game.service';
import { Game, GameCategory, GAME_CATEGORIES, NewGame } from '../../models/game.model';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { resizeImage } from '../../utils/image.utils';
import { findById } from '../../utils/find.utils';
import { DigitsOnlyDirective } from '../../directives/digits-only.directive';
import { ToastService } from '../../services/toast.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { hasVisibleError } from '../../utils/form.utils';

const BYTES_PER_MB = 1024 * 1024;
const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * BYTES_PER_MB;

@Component({
  selector: 'app-game-new',
  imports: [ReactiveFormsModule, RouterLink, GameCardComponent, DigitsOnlyDirective],
  templateUrl: './game-new.component.html',
  styleUrl: './game-new.component.css',
  host: {
    '(window:beforeunload)': 'warnBeforeUnload($event)',
  },
})

export class GameNewComponent implements OnInit, HasUnsavedChanges {
  private formBuilder = inject(NonNullableFormBuilder);
  private gameService = inject(GameService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  categories = GAME_CATEGORIES;
  maxImageMb = MAX_IMAGE_MB;

  private existingNames: string[] = [];

  editingId = signal<number | null>(null);
  isLoading = signal(true);
  loadError = signal('');

  isSaving = signal(false);
  saveError = signal('');

  isReadingImage = signal(false);
  imageError = signal('');

  nameIsUnique = (control: AbstractControl) => {
    const name = control.value.trim().toLowerCase();
    const exists = this.existingNames.some((existingName) => existingName.toLowerCase() === name);
    return exists ? { duplicate: true } : null;
  };

  maxNotBelowMin = (form: AbstractControl) => {
    const { minPlayers, maxPlayers } = form.value;
    return maxPlayers < minPlayers ? { playersRange: true } : null;
  };

  form = this.formBuilder.group(
    {
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(40), this.nameIsUnique],
      ],
      category: ['' as GameCategory | '', Validators.required],
      minPlayers: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
      maxPlayers: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
      duration: [45, [Validators.required, Validators.min(5), Validators.max(600)]],
      image: [''],
    },
    { validators: this.maxNotBelowMin },
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.editingId.set(id);

    this.gameService.getAll().subscribe({
      next: (games) => {
        this.existingNames = games.filter((game) => game.id !== id).map((game) => game.name);

        if (id) {
          const game = findById(games, id);
          if (!game) {
            this.loadError.set('Não encontrámos este jogo. Pode ter sido removido.');
            this.isLoading.set(false);
            return;
          }
          this.form.setValue({
            name: game.name,
            category: game.category,
            minPlayers: game.minPlayers,
            maxPlayers: game.maxPlayers,
            duration: game.duration,
            image: game.image,
          });
        }

        this.form.controls.name.updateValueAndValidity();
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Não foi possível carregar os jogos. Verifique a ligação e tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.isSaving();
  }

  warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) event.preventDefault();
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.imageError.set('');

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Escolha um ficheiro de imagem (JPG, PNG ou WebP).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set(`A imagem tem mais de ${MAX_IMAGE_MB} MB. Escolha uma mais pequena.`);
      return;
    }

    this.isReadingImage.set(true);
    try {
      const dataUrl = await resizeImage(file);
      this.form.controls.image.setValue(dataUrl);
      this.form.markAsDirty();
    } catch {
      this.imageError.set('Não foi possível ler esta imagem. Experimente outro ficheiro.');
    } finally {
      this.isReadingImage.set(false);
    }
  }

  removeImage(): void {
    this.form.controls.image.setValue('');
    this.form.markAsDirty();
    this.imageError.set('');
  }

  get preview(): Game {
    const values = this.form.getRawValue();
    return {
      id: 0,
      name: values.name.trim() || 'Nome do jogo',
      category: (values.category || 'Estratégia') as GameCategory,
      minPlayers: values.minPlayers,
      maxPlayers: values.maxPlayers,
      duration: values.duration,
      image: values.image,
    };
  }

  showError(field: keyof typeof this.form.controls, error: string): boolean {
    return hasVisibleError(this.form.controls[field], error);
  }

  submit(): void {
    if (this.form.invalid || this.isReadingImage()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const newGame: NewGame = {
      name: values.name.trim(),
      category: values.category as GameCategory,
      minPlayers: values.minPlayers,
      maxPlayers: values.maxPlayers,
      duration: values.duration,
      image: values.image,
    };

    const editingId = this.editingId();
    const request = editingId === null ? this.gameService.create(newGame) : this.gameService.update(editingId, newGame);

    this.isSaving.set(true);
    this.saveError.set('');

    request.subscribe({
      next: (saved) => {
        this.toastService.show(editingId === null ? 'Jogo adicionado.' : 'Alterações ao jogo guardadas.');
        this.router.navigate(['/jogos', saved.id]);
      },
      error: () => {
        this.saveError.set('Não foi possível guardar o jogo. Verifique a ligação e tente novamente.');
        this.isSaving.set(false);
      },
    });
  }
}