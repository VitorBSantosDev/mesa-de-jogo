import { PlayerAvatar } from '../../models/player.model';
import { Grid, createPixelCanvas } from '../battle-scene/pixel-art';

interface ChampionLook {
  skin: string;
  hair: string;
  hairDark?: string;
  hairStyle: 'short' | 'long' | 'shoulder' | 'curly' | null;
  ears: 'round' | 'pointed';
  tunic: string;
  sleeve: string;
  belt: string;
  cape?: string;
  dress?: boolean;
  beard?: string;
  headgear?: 'hat' | 'helmet' | 'sauron';
  hands?: string;
}

const BASE_LOOK: ChampionLook = {
  skin: '#f0c39a', hair: '#4a2f1a', hairStyle: 'short', ears: 'round', tunic: '#4f8a3f', sleeve: '#3f6f32', belt: '#5c3d20',
};

const LOOKS: Record<PlayerAvatar, Partial<ChampionLook>> = {
  gandalf: { hair: '#dcdcdc', hairStyle: 'long', tunic: '#9aa1aa', sleeve: '#8a9199', dress: true, beard: '#ecebe4', headgear: 'hat', belt: '#6d737b' },
  sauron: { skin: '#2c2d34', tunic: '#3b3c45', sleeve: '#2c2d34', hands: '#55565f', belt: '#7d1f1a', cape: '#141218', headgear: 'sauron', hairStyle: null },
  frodo: { hair: '#3b2414', hairDark: '#22140a', hairStyle: 'curly', tunic: '#8a5a2e', sleeve: '#ece4cf', cape: '#5e6b4a' },
  aragorn: { hair: '#3e2716', hairStyle: 'shoulder', tunic: '#4b5236', sleeve: '#3d4330', cape: '#2f3a28', beard: '#3e2716' },
  legolas: { hair: '#f0d878', hairStyle: 'long', ears: 'pointed', tunic: '#4f8a3f', sleeve: '#3f6f32' },
  gimli: { hair: '#b4532a', tunic: '#7b848e', sleeve: '#6f4a2a', beard: '#b4532a', headgear: 'helmet', belt: '#c99a2e' },
  galadriel: { hair: '#f3dd8c', hairStyle: 'long', ears: 'pointed', tunic: '#f4f2ec', sleeve: '#f4f2ec', dress: true, belt: '#e2b856' },
  pippin: { hair: '#a5582a', hairDark: '#723818', hairStyle: 'curly', tunic: '#b0905c', sleeve: '#ece4cf', cape: '#4f73b8' },
  arwen: { hair: '#2a1a12', hairStyle: 'long', ears: 'pointed', tunic: '#6a4a9c', sleeve: '#5a3c88', dress: true, belt: '#c99a2e' },
  boromir: { hair: '#7a4a24', hairStyle: 'shoulder', tunic: '#9e2c34', sleeve: '#6e1c26', cape: '#4a3424', beard: '#7a4a24' },
  sam: { hair: '#9a6a3a', hairDark: '#6b4523', hairStyle: 'curly', tunic: '#7d6440', sleeve: '#ece4cf' },
  merry: { hair: '#b8863f', hairDark: '#87602a', hairStyle: 'curly', tunic: '#3f7a36', sleeve: '#ece4cf', cape: '#2f5a28' },
};

const SAURON_HELMET = [
  '......jj......', '......jj......', '.j....mn....j.', '.j....mn....j.', '.m.j..mn..j.m.',
  '.m.j..mn..j.m.', '.m.m..mn..m.m.', '.mnm..mn..mnm.', '.mmm..mn..mmm.', '.mmmm.mn.mmmm.',
  '.mmmmmjjmmmmm.', 'nmmmmmjjmmmmmn', 'nmmnnmjjmnnmmn', '.mmmnmjjmnmmm.', '.mmmmnjjnmmmm.',
  '.mmmmmjjmmmmm.', '.mrrmmjjmmrrm.', '.mmrrmjjmrrmm.', '.mmmrrjjrrmmm.', '.mmmmmjjmmmmm.',
  '..mnmmjjmmnm..', '..mnmmjjmmnm..', '..mnmnjjnmnm..', '...mmnjjnmm...', '...mmnjjnmm...',
  '....mmjjmm....', '.....mjjm.....', '......jj......',
];

const RING = [
  '...GGGGGG...',
  '.GGFFWWFFGG.',
  'GFFooooooFFG',
  'GFooooooooFG',
  'GFFooooooFFG',
  '.GGFFFFFFGG.',
  '...GGGGGG...',
];

export const SAURON_EYES = '#ff4a2a';

export interface PixelArt {
  grid: Grid;
  palette: Record<string, string | undefined>;
}

function addOutline(grid: Grid, isSolid: (ch: string) => boolean): void {
  const copy = grid.map((row) => [...row]);
  copy.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch !== '.') return;
      const touchesFigure = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const neighbour = copy[y + dy]?.[x + dx];
        return neighbour !== undefined && isSolid(neighbour);
      });
      if (touchesFigure) grid[y][x] = 'k';
    }),
  );
}

export function buildChampion(avatar: PlayerAvatar): PixelArt {
  const look: ChampionLook = { ...BASE_LOOK, ...LOOKS[avatar] };
  const { grid, plot, line, polygon } = createPixelCanvas(34, 40);
  const rect = (x0: number, y0: number, x1: number, y1: number, color: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) plot(x, y, color);
  };
  const hasBigBeard = avatar === 'gandalf' || avatar === 'gimli';

  if (look.cape) polygon([[5, 29], [28, 29], [32, 40], [1, 40]], 'c');
  if (look.hairStyle === 'long') rect(10, 15, 23, 31, 'h');
  if (look.hairStyle === 'shoulder') rect(10, 15, 23, 26, 'h');

  polygon([[8, 28], [25, 28], [28, 40], [5, 40]], 't');
  line(14, 28, 16, 31, 'v');
  rect(16, 31, 17, 31, 'v');
  if (avatar === 'gimli') for (let y = 32; y <= 39; y += 2) for (let x = 9; x <= 16; x += 2) plot(x + (y % 4 ? 1 : 0), y, 'm');
  if (avatar === 'sauron') {
    line(16, 33, 11, 36, 'n');
    line(16, 37, 12, 39, 'n');
  }
  if (!look.dress) line(6, 38, 16, 38, 'e');

  line(9, 29, 6, 22, 'v', 3);
  line(6, 22, 5, 14, 'a', 3);
  rect(3, 10, 8, 13, 'a');
  [3, 5, 7].forEach((x) => rect(x, 8, x, 9, 'a'));
  rect(9, 12, 9, 13, 'a');

  if (avatar === 'sauron') {
    polygon([[4, 25], [9, 22], [13, 26], [13, 31], [8, 33], [4, 30]], 'm');
    line(5, 28, 10, 24, 'n');
    line(6, 31, 12, 27, 'n');
    line(5, 25, 9, 23, 'u');
    [[4, 24], [3, 24], [3, 23], [3, 22], [2, 22], [2, 21], [1, 20]].forEach(([x, y]) => plot(x, y, 'm'));
    plot(1, 19, 'j');
    [[4, 29], [3, 28], [2, 28], [2, 27], [1, 27]].forEach(([x, y]) => plot(x, y, 'm'));
    plot(0, 26, 'j');
  }

  grid.forEach((row) => {
    for (let x = 0; x < 17; x++) row[33 - x] = row[x];
  });

  rect(15, 25, 18, 27, 's');
  rect(12, 15, 21, 23, 's');
  rect(13, 14, 20, 24, 's');
  if (look.ears === 'pointed') {
    rect(10, 18, 11, 19, 's');
    plot(9, 17, 's');
    plot(8, 16, 's');
    rect(22, 18, 23, 19, 's');
    plot(24, 17, 's');
    plot(25, 16, 's');
  } else if (look.headgear !== 'sauron') {
    rect(11, 18, 11, 20, 's');
    rect(22, 18, 22, 20, 's');
  }

  if (look.headgear === 'sauron') {
    for (let y = 27; y <= 31; y++) for (let x = 12; x <= 21; x++) plot(x, y, (x + y) % 2 ? 'm' : 'n');
    SAURON_HELMET.forEach((row, y) => {
      [...row].forEach((ch, i) => ch !== '.' && plot(10 + i, y + 2, ch));
      const first = row.search(/[^.]/);
      const last = row.length - 1 - [...row].reverse().join('').search(/[^.]/);
      if (y > 8) {
        plot(9 + first, y + 2, 'k');
        plot(11 + last, y + 2, 'k');
      }
    });
  } else {
    rect(14, 18, 15, 20, 'k');
    rect(18, 18, 19, 20, 'k');
    plot(14, 18, 'W');
    plot(18, 18, 'W');
    plot(13, 21, 'p');
    plot(20, 21, 'p');
    if (look.beard) {
      rect(12, 21, 21, hasBigBeard ? 28 : 25, 'd');
      if (hasBigBeard) rect(14, 29, 19, 31, 'd');
    }
    rect(15, 22, 18, 22, 'k');
    rect(16, 23, 17, 23, 'r');
    drawHair(avatar, look, rect, plot, line);
    if (look.headgear === 'hat') {
      [[19, 1, 21], [18, 2, 21], [17, 3, 20], [16, 4, 20], [15, 5, 19], [14, 6, 20], [14, 7, 20], [13, 8, 21], [12, 9, 21], [12, 10, 22], [11, 11, 22]]
        .forEach(([x0, y, x1]) => rect(x0, y, x1, y, 'H'));
      rect(11, 12, 22, 12, 'e');
      rect(7, 13, 26, 13, 'H');
    }
    if (look.headgear === 'helmet') {
      rect(12, 10, 21, 15, 'm');
      rect(13, 9, 20, 9, 'm');
      rect(12, 15, 21, 15, 'F');
      line(16, 9, 16, 14, 'W');
      line(17, 9, 17, 14, 'W');
    }
  }

  addOutline(grid, (ch) => ch !== '.');

  const palette: Record<string, string | undefined> = {
    s: look.skin, a: look.hands ?? look.skin, h: look.hair, q: look.hairDark, t: look.tunic, v: look.sleeve, c: look.cape, e: look.belt, d: look.beard,
    k: '#1a1410', m: '#7b848e', n: '#2c2d34', r: '#c0392b', p: '#f2a08a', H: '#8a8f96', F: '#f4cf68', W: '#fff6d6',
  };
  if (avatar === 'sauron') {
    Object.assign(palette, { r: SAURON_EYES, m: '#6e727c', j: '#c3c7ce', n: '#24252b', u: '#6b3a2a', a: '#3a3b44', v: '#2a2b31' });
  }
  return { grid, palette };
}

type Rect = (x0: number, y0: number, x1: number, y1: number, color: string) => void;
type Plot = (x: number, y: number, color: string) => void;
type Line = (x0: number, y0: number, x1: number, y1: number, color: string, thickness?: number) => void;

function drawHair(avatar: PlayerAvatar, look: ChampionLook, rect: Rect, plot: Plot, line: Line): void {
  if (look.hairStyle === 'curly') {
    // caracóis com duas cores; cada hobbit com o penteado dos filmes
    const curls = (x0: number, y0: number, x1: number, y1: number) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) plot(x, y, (x * 2 + y) % 5 === 0 ? 'q' : 'h');
    };
    if (avatar === 'frodo') {
      curls(11, 11, 22, 15);
      curls(10, 13, 12, 22);
      curls(21, 13, 23, 22);
      [13, 16, 19].forEach((x) => curls(x, 16, x + 1, 16));
      [12, 14, 16, 18, 20].forEach((x) => plot(x, 10, 'h'));
    } else if (avatar === 'sam') {
      curls(12, 12, 21, 15);
      curls(11, 13, 11, 17);
      curls(22, 13, 22, 17);
      line(15, 12, 14, 15, 'q');
      curls(16, 16, 20, 16);
    } else if (avatar === 'merry') {
      curls(11, 11, 22, 15);
      curls(10, 13, 11, 19);
      curls(22, 13, 23, 19);
      curls(12, 16, 19, 16);
      [12, 14, 16, 18, 20].forEach((x) => plot(x, 10, 'h'));
    } else {
      curls(11, 11, 22, 15);
      curls(10, 13, 11, 18);
      curls(22, 13, 23, 18);
      [[12, 10], [13, 9], [16, 10], [17, 9], [20, 10], [21, 9], [10, 12], [23, 12]].forEach(([x, y]) => plot(x, y, 'h'));
      [13, 14, 17, 19, 20].forEach((x) => plot(x, 16, 'h'));
    }
  } else if (look.hairStyle) {
    rect(12, 12, 21, 15, 'h');
    rect(13, 11, 20, 11, 'h');
    rect(12, 16, 12, 19, 'h');
    rect(21, 16, 21, 17, 'h');
    plot(15, 16, 'h');
    plot(18, 16, 'h');
  }
}

export function buildRing(): PixelArt {
  const grid: Grid = Array.from({ length: RING.length + 2 }, (_, y) =>
    Array.from({ length: RING[0].length + 2 }, (_, x) => RING[y - 1]?.[x - 1] ?? '.'),
  );
  addOutline(grid, (ch) => 'GFW'.includes(ch));
  grid.forEach((row) => row.forEach((ch, x) => ch === 'o' && (row[x] = '.')));
  return { grid, palette: { G: '#a8761c', F: '#f4cf68', W: '#fff6d6', k: '#1a1410' } };
}