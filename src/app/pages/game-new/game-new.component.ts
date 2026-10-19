import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

const BYTES_PER_MB = 1024 * 1024;
const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * BYTES_PER_MB;

@Component({
  selector: 'app-game-new',
  imports: [ReactiveFormsModule, RouterLink, GameCardComponent],
  templateUrl: './game-new.component.html',
  styleUrl: './game-new.component.css',
})

export class GameNewComponent implements OnInit {
  private formBuilder = inject(NonNullableFormBuilder);
  private gameService = inject(GameService);
  private router = inject(Router);

  categories = GAME_CATEGORIES;
  maxImageMb = MAX_IMAGE_MB;

  private existingNames: string[] = [];

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
    this.gameService.getAll().subscribe((games) => {
      this.existingNames = games.map((game) => game.name);
      this.form.controls.name.updateValueAndValidity();
    });
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
    } catch {
      this.imageError.set('Não foi possível ler esta imagem. Experimente outro ficheiro.');
    } finally {
      this.isReadingImage.set(false);
    }
  }

  removeImage(): void {
    this.form.controls.image.setValue('');
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
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
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

    this.isSaving.set(true);
    this.saveError.set('');

    this.gameService.create(newGame).subscribe({
      next: (created) => this.router.navigate(['/jogos', created.id]),
      error: () => {
        this.saveError.set('Não foi possível guardar o jogo. Confirme que a API está a correr.');
        this.isSaving.set(false);
      },
    });
  }
}