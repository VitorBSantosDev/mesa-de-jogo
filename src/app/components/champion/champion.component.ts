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
import { PlayerAvatar } from '../../models/player.model';
import { PixelArt, SAURON_EYES, buildChampion, buildRing } from './champion-art';

const FRAME_DURATION = 450;
const SPARKLES = [[9, 1], [24, 0], [10, 6], [23, 6]];

function paintPixels(canvas: HTMLCanvasElement, { grid, palette }: PixelArt, frame: number): void {
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = grid[0].length;
  canvas.height = grid.length;
  grid.forEach((row, y) =>
    row.forEach((ch, x) => {
      const color = frame && ch === 'r' && palette['r'] === SAURON_EYES ? '#ffb347' : palette[ch];
      if (ch === '.' || !color) return;
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    }),
  );

  if (frame) {
    context.fillStyle = '#fff6d6';
    SPARKLES.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
  }
}

@Component({
  selector: 'app-champion',
  templateUrl: './champion.component.html',
  styleUrl: './champion.component.css',
})

export class ChampionComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);

  avatar = input.required<PlayerAvatar>();

  figure = viewChild.required<ElementRef<HTMLCanvasElement>>('figure');
  ring = viewChild.required<ElementRef<HTMLCanvasElement>>('ring');

  private art = computed(() => buildChampion(this.avatar()));

  private frame = 0;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterRenderEffect(() => paintPixels(this.figure().nativeElement, this.art(), this.frame));
  }

  ngAfterViewInit(): void {
    paintPixels(this.ring().nativeElement, buildRing(), 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.frame = 1 - this.frame;
        paintPixels(this.figure().nativeElement, this.art(), this.frame);
      }, FRAME_DURATION);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}