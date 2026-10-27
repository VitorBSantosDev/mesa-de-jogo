import { Player } from '../../models/player.model';
import { PX, drawDisc, drawSprite } from './pixel-art';
import { SpriteKey, getSpriteGrid } from './sprites';

export const SCENE_WIDTH = 240;
export const SCENE_HEIGHT = 54;
const GROUND = 42;
const HALF = SCENE_WIDTH / 2;

interface ArmyUnit {
  key: SpriteKey;
  x: number;
  baseline: number;
  scale?: number;
  hasWings?: boolean;
  hasAura?: boolean;
  hasGlow?: boolean;
}

type FlameOrigin = [x: number, y: number, side: number];

function getHeroLayout(heroCount: number) {
  const startX = 8;
  const rankShift = 8;
  const hasTwoRanks = heroCount > 5;
  const columns = hasTwoRanks ? Math.ceil(heroCount / 2) : heroCount;
  const room = HALF - startX - 6 - (hasTwoRanks ? rankShift : 0) - 14;
  const step = columns > 1 ? Math.min(18, Math.floor(room / (columns - 1))) : 18;
  return { startX, rankShift, hasTwoRanks, step };
}

function getArmyLayout(): ArmyUnit[] {
  const from = HALF + 6;
  const to = SCENE_WIDTH - 2;
  const balrogX = to - 50;
  const orcs: ArmyUnit[] = [];
  for (let x = from; x + 12 <= balrogX + 10; x += 11) orcs.push({ key: 'orc', x, baseline: GROUND + 6 });

  return [
    ...orcs,
    { key: 'balrog', x: balrogX, baseline: GROUND + 8, scale: 2, hasWings: true },
    { key: 'nazgul', x: from + 2, baseline: GROUND + 11, hasGlow: true },
    { key: 'sauron', x: to - 86, baseline: GROUND + 11, hasAura: true },
  ];
}

function drawMinasTirith(ctx: CanvasRenderingContext2D, cx: number, base: number): void {
  for (let x = cx - 40; x <= cx + 40; x++) {
    const peak = Math.round(7 + Math.abs(x - cx - 6) * 0.55 + 1.5 * Math.sin(x / 4));
    ctx.fillStyle = '#8ea3b3';
    ctx.fillRect(x, peak, 1, base - peak);
    if (x >= cx - 14 && x <= cx + 26 && peak < 13) {
      ctx.fillStyle = '#a9bac6';
      ctx.fillRect(x, peak, 1, 2);
    }
  }

  const tiers = 7;
  const tierHeight = 3;
  for (let t = 0; t < tiers; t++) {
    const halfWidth = 21 - t * 2.5;
    const y = base - (t + 1) * tierHeight;
    const left = Math.round(cx - halfWidth);
    const width = Math.round(halfWidth * 2);
    ctx.fillStyle = '#eef1f2';
    ctx.fillRect(left, y, width, tierHeight);
    ctx.fillStyle = '#c3cad0';
    ctx.fillRect(left, y + tierHeight - 1, width, 1);
    ctx.fillStyle = '#d6dce0';
    ctx.fillRect(left + width - 3, y, 3, tierHeight - 1);
    ctx.fillStyle = '#8f99a2';
    for (let x = left + 2; x < left + width - 3; x += 3) ctx.fillRect(x, y + 1, 1, 1);
  }

  ctx.fillStyle = '#cfd5da';
  for (let j = 0; j < tiers * tierHeight - 2; j++) {
    const width = Math.max(1, Math.round((tiers * tierHeight - j) / 5));
    ctx.fillRect(cx - Math.floor(width / 2), base - 1 - j, width, 1);
  }

  const top = base - tiers * tierHeight;
  ctx.fillStyle = '#f7f9fa';
  ctx.fillRect(cx - 1, top - 9, 3, 9);
  ctx.fillRect(cx, top - 12, 1, 3);
  ctx.fillStyle = '#c3cad0';
  ctx.fillRect(cx + 1, top - 9, 1, 9);
  ctx.fillStyle = '#8f99a2';
  ctx.fillRect(cx, top - 6, 1, 1);
}

function getFlameColor(t: number, k: number): string {
  if (t < 0.2) return k % 3 ? PX.L : PX.F;
  if (t < 0.5) return PX.F;
  if (t < 0.78) return PX.f;
  if (t < 0.92) return PX.E;
  return PX.i;
}

function drawFlameFan(
  ctx: CanvasRenderingContext2D,
  origins: FlameOrigin[],
  frame: number,
  streaks: number,
  length: number,
  isDim: boolean,
): void {
  for (const [originX, originY, side] of origins) {
    for (let n = 0; n < streaks; n++) {
      const share = n / (streaks - 1);
      const streakLength = Math.round(length * (1 - share * 0.25)) + ((frame + n) % 2) * 2;
      let angle = ((60 - share * 75) * Math.PI) / 180;
      let px = originX;
      let py = originY;

      for (let k = 0; k <= streakLength; k++) {
        const t = k / streakLength;
        angle += (share * 0.7) / streakLength;
        px += Math.cos(angle) * side;
        py -= Math.sin(angle);
        const wave = Math.sin(t * 6 + n * 1.7 + frame * 1.6) * 1.6 * t;
        const x = Math.round(px + Math.sin(angle) * wave * side);
        const y = Math.round(py + Math.cos(angle) * wave);

        if (isDim) {
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = t < 0.5 ? PX.f : t < 0.8 ? PX.i : '#7a1c10';
          ctx.fillRect(x - 1, y, 3, 2);
          continue;
        }

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff6a1a';
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.globalAlpha = 1;
        ctx.fillStyle = getFlameColor(t, k + frame);
        ctx.fillRect(x, y, t < 0.45 ? 2 : 1, 1);

        if (k === streakLength) {
          for (let e = 0; e < 2; e++) {
            ctx.fillStyle = e ? PX.f : PX.F;
            ctx.fillRect(x + side * (((e * 3 + n + frame) % 4) - 1), y - 2 - e * 2 - ((frame + e + n) % 2), 1, 1);
          }
        }
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawFireWings(ctx: CanvasRenderingContext2D, x: number, baseline: number, frame: number): void {
  const top = baseline - 40;
  const origins: FlameOrigin[] = [[x + 22, top + 14, -1], [x + 38, top + 12, 1]];

  ctx.globalAlpha = 0.16;
  drawDisc(ctx, x + 25, top + 18, 20, '#ff6a1a');
  ctx.globalAlpha = 1;
  drawFlameFan(ctx, origins, frame, 12, 22, true);
  drawFlameFan(ctx, origins, frame, 5, 24, false);

  for (let e = 0; e < 10; e++) {
    ctx.fillStyle = e % 3 ? PX.f : PX.F;
    ctx.fillRect(x - 10 + ((e * 37 + frame * 5) % 70), top + 34 - ((e * 13 + frame * 4) % 50), 1, 1);
  }
}

function drawFireWhip(ctx: CanvasRenderingContext2D, x: number, baseline: number, frame: number): void {
  const top = baseline - 40;
  const hand = [x + 3, top + 28];
  const bend = [x - 2, GROUND + 14];
  const tip = [x + 46, GROUND + 7 - frame * 2];
  const steps = 70;

  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const u = 1 - t;
    const wave = Math.sin(t * 9 + frame * 2) * 1.5 * t;
    const px = Math.round(u * u * hand[0] + 2 * u * t * bend[0] + t * t * tip[0]);
    const py = Math.round(u * u * hand[1] + 2 * u * t * bend[1] + t * t * tip[1] + wave);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ff6a1a';
    ctx.fillRect(px - 1, py - 1, 3, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = getFlameColor(t, k + frame);
    ctx.fillRect(px, py, 1, t < 0.3 ? 2 : 1);
  }

  ctx.fillStyle = frame ? PX.L : PX.F;
  [[0, -2], [-2, 1], [1, 2], [-3, -2]].forEach(([dx, dy], k) => {
    if ((k + frame) % 2 === 0) ctx.fillRect(tip[0] + dx, tip[1] + dy, 1, 1);
  });
}

function drawDaySide(ctx: CanvasRenderingContext2D, frame: number): void {
  const skyBands: [string, number, number][] = [
    ['#3d7fd0', 0, 8], ['#5b98dc', 8, 8], ['#7fb2e6', 16, 8], ['#a9cdee', 24, 8], ['#cfe4f2', 32, GROUND - 32],
  ];
  skyBands.forEach(([color, y, height]) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, y, HALF + 8, height);
  });

  drawDisc(ctx, 20, 10, 6, '#ffd75e');
  drawDisc(ctx, 20, 10, 4, '#fff1a8');
  ctx.fillStyle = '#ffe48a';
  [[20, 1], [20, 19], [11, 10], [29, 10], [13, 3], [27, 3], [13, 17], [27, 17]].forEach(([x, y]) =>
    ctx.fillRect(x, y, 1, frame ? 2 : 1),
  );

  drawMinasTirith(ctx, 76, GROUND - 5);

  [[34, 6], [102, 13]].forEach(([cx, cy], k) => {
    const dx = frame && k % 2 ? 1 : 0;
    drawDisc(ctx, cx + dx, cy, 3, '#f4f8fb');
    drawDisc(ctx, cx + 4 + dx, cy - 1, 4, '#ffffff');
    drawDisc(ctx, cx + 9 + dx, cy, 3, '#f4f8fb');
  });

  for (let x = 0; x < HALF + 8; x++) {
    const far = Math.round(GROUND - 9 + 3 * Math.sin(x / 9));
    ctx.fillStyle = '#8fb37a';
    ctx.fillRect(x, far, 1, GROUND - far);
    const near = Math.round(GROUND - 4 + 2 * Math.sin(x / 5 + 1));
    ctx.fillStyle = '#5c8f45';
    ctx.fillRect(x, near, 1, GROUND - near);
  }
}

function drawDarkSide(ctx: CanvasRenderingContext2D, frame: number): void {
  const skyBands: [string, number, number][] = [
    ['#1f1a1d', 0, 10], ['#2a2326', 10, 10], ['#352b2d', 20, 8], ['#40302c', 28, 7], ['#5a3526', 35, GROUND - 35],
  ];
  skyBands.forEach(([color, y, height]) => {
    ctx.fillStyle = color;
    ctx.fillRect(HALF, y, SCENE_WIDTH - HALF, height);
  });

  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = ['#2b2427', '#352d30', '#3f3639', '#2f282b'];
  const puffs: [number, number, number, boolean][] = [];
  for (let k = 0; k < 12; k++) puffs.push([HALF - 6 + Math.round(random() * 10), Math.round(random() * 16), 3 + Math.round(random() * 3), true]);
  for (let k = 0; k < 24; k++) puffs.push([HALF + Math.round(random() * (SCENE_WIDTH - HALF)), Math.round(random() * 9), 3 + Math.round(random() * 4), false]);
  puffs.forEach(([cx, cy, radius, isEdge], k) => {
    const dx = frame && k % 3 === 0 ? 1 : 0;
    drawDisc(ctx, cx + dx, cy, radius, isEdge ? '#4d4447' : tones[k % tones.length]);
    if (radius > 4) drawDisc(ctx, cx + dx - 1, cy - 1, radius - 3, isEdge ? '#5c5255' : '#40373a');
  });

  for (let x = HALF; x < SCENE_WIDTH; x++) {
    const ridge = Math.round(GROUND - 7 + 2 * Math.sin(x / 6) + Math.sin(x / 2.3));
    ctx.fillStyle = '#1c1214';
    ctx.fillRect(x, ridge, 1, GROUND - ridge);
  }

  const doom = HALF + 12;
  ctx.fillStyle = '#140c0e';
  for (let i = 0; i < 40; i++) {
    const top = 14 + Math.abs(i - 20);
    ctx.fillRect(doom + i, top, 1, GROUND - top);
  }
  ctx.fillStyle = frame ? '#ffb347' : '#ff6a2a';
  ctx.fillRect(doom + 19, 13, 2, 2);
  ctx.fillRect(doom + 20, 16, 1, 5);
  ctx.fillRect(doom + 19, 22, 1, 4);
  ctx.fillStyle = '#5a3526';
  ctx.globalAlpha = 0.55;
  ctx.fillRect(doom + 18, 9, 4, 3);
  ctx.fillRect(doom + 17, 5, 5, 3);
  ctx.globalAlpha = 1;
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  for (let x = 0; x < SCENE_WIDTH; x++) {
    const isDay = x < HALF + Math.round(2 * Math.sin(x / 3));
    ctx.fillStyle = isDay ? '#4f7d39' : '#2b2016';
    ctx.fillRect(x, GROUND, 1, SCENE_HEIGHT - GROUND);
    ctx.fillStyle = isDay ? '#79b05a' : '#4a3624';
    ctx.fillRect(x, GROUND, 1, 1);
  }
  ctx.fillStyle = '#3f6b2f';
  for (let x = 4; x < HALF - 4; x += 9) ctx.fillRect(x, GROUND + 3 + (x % 3) * 2, 2, 1);
  ctx.fillStyle = '#3a2b1e';
  for (let x = HALF + 5; x < SCENE_WIDTH; x += 11) ctx.fillRect(x, GROUND + 3 + (x % 3) * 2, 2, 1);
}

function drawHeroes(ctx: CanvasRenderingContext2D, heroes: Player[], frame: number): void {
  const { startX, rankShift, hasTwoRanks, step } = getHeroLayout(heroes.length);
  const positioned = heroes.map((hero, i) => {
    const isBackRank = hasTwoRanks && i % 2 === 1;
    const column = hasTwoRanks ? Math.floor(i / 2) : i;
    return {
      hero,
      isBackRank,
      x: startX + column * step + (isBackRank ? rankShift : 0),
      baseline: (isBackRank ? GROUND + 6 : GROUND + 11) - ((i + frame) % 2),
    };
  });

  [...positioned.filter((item) => item.isBackRank), ...positioned.filter((item) => !item.isBackRank)].forEach(
    ({ hero, x, baseline }) => drawSprite(ctx, getSpriteGrid(hero.avatar), x, baseline, false, frame),
  );
}

function drawArmy(ctx: CanvasRenderingContext2D, frame: number): void {
  getArmyLayout().forEach((unit, k) => {
    if (unit.hasAura) {
      ctx.globalAlpha = 0.16;
      drawDisc(ctx, unit.x + 18, GROUND - 11, 17, '#ff4a2a');
      ctx.globalAlpha = 0.2;
      drawDisc(ctx, unit.x + 18, GROUND - 11, 10, '#ff4a2a');
      ctx.globalAlpha = 1;
    }
    if (unit.hasWings) drawFireWings(ctx, unit.x, unit.baseline, frame);
    if (unit.hasGlow) {
      ctx.globalAlpha = 0.1;
      drawDisc(ctx, unit.x + 15, GROUND - 7, 12 + frame * 2, '#9fd8c0');
      ctx.globalAlpha = 1;
    }

    const key: SpriteKey = unit.key === 'sauron' && frame ? 'sauronWind' : unit.key;
    const bob = unit.key === 'balrog' ? 0 : (k + frame) % 2;
    drawSprite(ctx, getSpriteGrid(key), unit.x, unit.baseline - bob, true, frame, unit.scale ?? 1);

    if (unit.hasWings) drawFireWhip(ctx, unit.x, unit.baseline, frame);
  });
}

function drawClash(ctx: CanvasRenderingContext2D, frame: number): void {
  const x = HALF + 1;
  const sparks = [[0, 0], [-2, -2], [2, -2], [-2, 2], [2, 2], [0, -4], [0, 4], [-4, 0], [4, 0]];
  ctx.fillStyle = frame ? PX.F : PX.f;
  sparks.forEach(([dx, dy], k) => {
    if ((k + frame) % 2 === 0 || k === 0) ctx.fillRect(x + dx, GROUND - 8 + dy, 1, 1);
  });
}

export function drawBattle(ctx: CanvasRenderingContext2D, players: Player[], frame: number): void {
  const heroes = players.filter((player) => player.avatar !== 'sauron');
  const hasSauron = heroes.length < players.length;

  drawDaySide(ctx, frame);
  drawDarkSide(ctx, frame);
  drawGround(ctx);
  drawHeroes(ctx, heroes, frame);

  if (hasSauron) {
    drawArmy(ctx, frame);
    if (heroes.length) drawClash(ctx, frame);
  }
}
