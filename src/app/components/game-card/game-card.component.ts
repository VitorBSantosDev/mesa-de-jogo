import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game, GameCategory } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css',
})

export class GameCardComponent {
  @Input({ required: true }) game!: Game;

  @Output() open = new EventEmitter<number>();

  private categoryColors: Record<GameCategory, string> = {
    'Estratégia': '#4a55c4',
    'Colocação de peças': '#2f8a6a',
    'Família': '#c4622d',
    'Party': '#b23a7a',
    'Abstrato': '#2a7fb0',
    'Cartas': '#7a5bc4',
  };

  get color(): string {
    return this.categoryColors[this.game.category];
  }

  onClick(): void {
    this.open.emit(this.game.id);
  }
}