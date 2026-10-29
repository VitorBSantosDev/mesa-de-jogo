import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  afterRenderEffect,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Player } from '../../models/player.model';
import { getCharacterName } from '../../utils/character.utils';
import { SCENE_HEIGHT, SCENE_WIDTH, drawBattle } from './battle-drawing';

const FRAME_DURATION = 450;

@Component({
  selector: 'app-battle-scene',
  templateUrl: './battle-scene.component.html',
  styleUrl: './battle-scene.component.css',
})

export class BattleSceneComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);

  players = input.required<Player[]>();

  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly width = SCENE_WIDTH;
  readonly height = SCENE_HEIGHT;

  description = computed(() => {
    const names = this.players().map((player) => `${player.name} (${getCharacterName(player.avatar)})`);
    return names.length ? `Cena de batalha em pixel art: ${names.join(', ')}` : 'Cena de batalha em pixel art';
  });

  private frame = 0;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterRenderEffect(() => this.drawScene(this.players()));
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.frame = 1 - this.frame;
        this.drawScene(this.players());
      }, FRAME_DURATION);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private drawScene(players: Player[]): void {
    const context = this.canvas().nativeElement.getContext('2d');
    if (context) drawBattle(context, players, this.frame);
  }
}
