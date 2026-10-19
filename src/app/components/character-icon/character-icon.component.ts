import { Component, computed, input } from '@angular/core';
import { PlayerAvatar } from '../../models/player.model';

@Component({
  selector: 'app-character-icon',
  templateUrl: './character-icon.component.html',
  styleUrl: './character-icon.component.css',
})

export class CharacterIconComponent {
  avatar = input.required<PlayerAvatar>();

  color = computed(() => `var(--char-${this.avatar()})`);
}