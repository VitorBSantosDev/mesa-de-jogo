import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Match } from '../../models/match.model';
import { Player } from '../../models/player.model';
import { CharacterIconComponent } from '../character-icon/character-icon.component';
import { WinnerRingComponent } from '../winner-ring/winner-ring.component';
import { findById } from '../../utils/find.utils';
import { sortByScore } from '../../utils/match.utils';

@Component({
  selector: 'app-match-card',
  imports: [RouterLink, DatePipe, CharacterIconComponent, WinnerRingComponent],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.css',
})
export class MatchCardComponent {
  protected authService = inject(AuthService);

  match = input.required<Match>();
  players = input.required<Player[]>();
  gameName = input<string>();

  sortedResults = computed(() => sortByScore(this.match()));

  findPlayer(id: number): Player | undefined {
    return findById(this.players(), id);
  }
}