import { PlayerAvatar } from '../../models/player.model';
import { Grid, createPixelCanvas, shrinkGrid } from './pixel-art';

export type SpriteKey = PlayerAvatar | 'orc' | 'balrog' | 'nazgul' | 'sauronWind';

type Rect = [x: number, y: number, width: number, height: number, color: string];

interface SpriteDefinition {
  rows?: string[];
  base?: string[];
  map?: Record<string, string>;
  add?: Rect[];
  shrink?: number;
}

const HERO_PADDING_TOP = 7;
const EVIL_SPRITES: SpriteKey[] = ['sauron', 'sauronWind', 'orc', 'balrog', 'nazgul'];

const TALL = [
  '...HHHH.......', '..HHHHHH......', '..HHssss......', '..HHssse......', '..HHssss......',
  '...HHss.......', '..CTTTTC......', '.CCTTTTTC.....', '.CCTTTTTTs....', '.CCTTTTTC.....',
  '.CCBBBBBC.....', '.CCTTTTTC.....', '.CCTTTTTC.....', '..CPPPPC......', '..PP..PP......',
  '..PP..PP......', '..PP..PP......', '..KK..KK......', '.KKK..KKK.....',
];
const GOWN = [
  ...TALL.slice(0, 13),
  '.CTTTTTTC.....', '.TTTTTTTT.....', 'TTTTTTTTTT....', 'TTTTTTTTTT....', 'TTTTTTTTTT....', '.TTTTTTTT.....',
];
const SHORT = [
  '...HHHH.....', '..HHHHHH....', '..HHssss....', '..Hsssse....', '...ssss.....', '..CCCCCC....',
  '.CCTTTTC....', '.CCTTTTCs...', '.CCTTTTC....', '.CCBBBBC....', '.CCTTTTC....', '..CTTTT.....',
  '..ss..ss....', '.sss..sss...',
];
const LUNGE: Rect[] = [[6, 14, 3, 5, '.'], [7, 14, 2, 1, 'P'], [8, 15, 2, 1, 'P'], [9, 16, 2, 1, 'P'], [9, 17, 2, 1, 'K'], [9, 18, 3, 1, 'K']];

function buildSauron(wind: number): string[] {
  const { plot, line, polygon, highlightEdges, toRows } = createPixelCanvas(46, 46);
  const thickLine = (x0: number, y0: number, x1: number, y1: number, color: string, thickness: number) => {
    for (let k = 0; k < thickness; k++) line(x0, y0 + k, x1, y1 + k, color);
  };
  const helmet = [
    '.....j......', '...j.A.j....', '...A.A.A....', '.j.AjAjA.j..', '.A.AAAAA.A..',
    '.AjAAAAAjA..', '.AAAAAAAAAA.', '..aaaAjaaA..', '..aaaAjaaAj.', '..aRaAjaRAj.',
    '..aaRAjRaAj.', '..aaaAjaaAj.', '...aaAjaAj..', '...aaAjaAj..', '....aAjAj...',
    '.....ajj....', '....xaxax...', '....axaxa...',
  ];

  polygon([[12, 16], [17, 16], [16, 40], [14, 45], [2 - wind, 45 - wind], [0, 41 - 2 * wind], [5, 30]], 'k');
  line(9, 22, 4 - wind, 43, 'x');
  line(13, 22, 10, 44, 'x');
  for (let x = 1 + wind; x < 15; x += 3) plot(x, 45, '.');
  highlightEdges('k', 'X');

  polygon([[6, 20], [11, 20], [11, 25], [10, 30], [7, 30], [5, 25]], 'a');
  polygon([[11, 18], [27, 18], [26, 23], [24, 31], [14, 31], [12, 23]], 'a');
  polygon([[14, 32], [24, 32], [27, 39], [11, 39]], 'a');
  polygon([[12, 39], [17, 39], [16, 44], [11, 44]], 'a');
  polygon([[21, 39], [26, 39], [28, 44], [22, 44]], 'a');
  thickLine(26, 19, 30, 25, 'a', 3);
  thickLine(30, 25, 35, 23, 'a', 3);
  highlightEdges('a', 'A');

  line(13, 22, 18, 22, 'A');
  line(20, 22, 25, 22, 'A');
  line(19, 19, 19, 29, 'A');
  [25, 27].forEach((y) => {
    line(16, y, 17, y, 'A');
    line(21, y, 22, y, 'A');
  });
  for (let x = 14; x <= 24; x++) plot(x, 31, x % 3 ? 'R' : 'i');
  [15, 19, 23].forEach((x) => line(x, 33, x + (x - 19) / 3, 38, 'A'));
  [[13, 41], [14, 41], [22, 41], [23, 41]].forEach(([x, y]) => plot(x, y, 'A'));
  line(10, 45, 17, 45, 'A');
  line(21, 45, 29, 45, 'A');
  line(6, 24, 11, 24, 'A');
  polygon([[6, 30], [11, 30], [11, 34], [6, 34]], 'A');
  [7, 9].forEach((x) => plot(x, 31, 'j'));

  [[5, 17], [8, 15], [11, 14], [6, 20], [9, 18], [12, 17]].forEach(([x, y]) => {
    polygon([[x, y], [x + 4, y - 1], [x + 2, y + 4], [x - 1, y + 3]], 'A');
    plot(x - 1, y + 3, 'j');
    plot(x + 4, y - 1, 'j');
  });
  [[21, 14], [25, 14], [29, 15], [22, 17], [26, 17], [30, 18]].forEach(([x, y]) => {
    polygon([[x, y], [x + 4, y], [x + 5, y + 4], [x + 1, y + 3]], 'A');
    plot(x + 5, y + 4, 'j');
    plot(x, y, 'j');
  });
  plot(4, 14, 'j');
  plot(5, 13, 'A');
  plot(33, 13, 'j');
  plot(32, 14, 'A');

  plot(34, 29, 'A');
  plot(33, 30, 'j');
  plot(35, 30, 'j');
  plot(34, 28, 'A');
  line(35, 27, 36, 25, 'v');
  polygon([[35, 21], [38, 21], [38, 25], [35, 25]], 'A');
  thickLine(37, 19, 39, 13, 'a', 2);
  plot(38, 16, 'A');
  polygon([[37, 14], [41, 13], [44, 5], [43, 1], [42, -1], [39, 2], [37, 8]], 'A');
  line(39, 12, 42, 1, 'a');
  line(41, 13, 43, 5, 'a');
  line(40, 13, 43, 3, 'j');
  [[36, 12], [36, 8], [38, 4], [44, 9], [45, 5], [44, 2], [42, 0], [43, 0]].forEach(([x, y]) => plot(x, y, 'j'));

  helmet.forEach((row, y) => [...row].forEach((color, i) => color !== '.' && plot(14 + i, y, color)));
  return toRows();
}

function buildNazgul(): string[] {
  const { plot, line, polygon, highlightEdges, toRows } = createPixelCanvas(30, 36);

  polygon([[8, 3], [13, 4], [15, 10], [17, 31], [19, 35], [2, 35], [4, 31], [6, 11], [5, 6]], 'k');
  for (let x = 2; x <= 19; x += 2) plot(x, 35, '.');
  highlightEdges('k', 'X');
  polygon([[11, 6], [14, 7], [14, 10], [11, 10]], 'e');
  line(9, 13, 7, 33, 'x');
  line(12, 13, 14, 33, 'x');
  line(13, 13, 18, 17, 'k', 2);
  plot(19, 17, 'X');
  plot(19, 18, 'X');
  line(20, 17, 27, 10, 'H');
  line(21, 17, 27, 11, 'm');
  plot(28, 9, 'w');
  line(18, 19, 21, 16, 'A');
  return toRows();
}

const SPRITES: Record<SpriteKey, SpriteDefinition> = {
  gandalf: {
    rows: [
      '....g........', '....gg.......', '...ggg.......', '...gggg......', '..gggggg.....', 'GGGGGGGGG....',
      '...sssse.....', '...ssssss....', '..wwsssww....', '..wwwwwwwg...', '.gwwwwwwgg...', '.ggwwwwgg....',
      '.gggwwggg....', '.gggggggg....', '.Gggggggg....', '.Gggggggg....', '.GGggggGG....', '..GGggGG.....',
      '..kk..kk.....', '.kkk..kkk....',
    ],
    add: [[8, -5, 5, 5, 'F'], [9, -4, 3, 3, 'L'], [10, -6, 1, 1, 'L'], [7, -3, 1, 1, 'L'], [13, -3, 1, 1, 'L'], [10, -1, 1, 20, 'l'],
      [9, 6, 1, 3, 'g'], [10, 5, 1, 1, 's']],
  },
  aragorn: {
    base: TALL,
    map: { H: 'N', C: 'C', T: 't', B: 'l', P: 'n', K: 'k' },
    add: [[5, 5, 2, 1, 'N'], ...LUNGE, [10, 7, 1, 1, 'l'], [10, 6, 1, 1, 'Y'], [11, 7, 1, 1, 'Y'],
      [11, 6, 1, 1, 'm'], [12, 5, 1, 1, 'm'], [13, 4, 1, 1, 'm'], [14, 3, 1, 1, 'm'], [15, 2, 1, 1, 'm']],
  },
  boromir: {
    base: TALL,
    map: { H: 'n', C: 'R', T: 'r', B: 'l', P: 'N', K: 'k' },
    add: [[9, 6, 3, 7, 'M'], [8, 7, 5, 5, 'M'], [9, 7, 3, 5, 'r'], [10, 9, 1, 1, 'Y'],
      [1, -4, 1, 9, 'm'], [1, -5, 1, 1, 'w'], [0, 5, 3, 1, 'Y'], [1, 6, 1, 1, 's']],
  },
  legolas: {
    base: TALL,
    map: { H: 'y', C: 'C', T: 'c', B: 'l', P: 'C', K: 'l' },
    add: [[1, 2, 1, 8, 'y'], [9, 8, 1, 1, 'c'], [10, 8, 2, 1, 'c'], [12, 8, 1, 1, 's'],
      [12, 1, 1, 1, 'l'], [13, 2, 1, 1, 'l'], [14, 3, 1, 9, 'l'], [13, 12, 1, 1, 'l'], [12, 13, 1, 1, 'l'],
      [12, 2, 1, 1, 'w'], [11, 3, 1, 1, 'w'], [10, 4, 1, 1, 'w'], [9, 5, 1, 1, 'w'], [9, 6, 1, 1, 's'], [10, 7, 1, 1, 'w'],
      [11, 9, 1, 1, 'w'], [12, 10, 1, 1, 'w'], [12, 11, 1, 1, 'w'], [10, 6, 5, 1, 't'], [15, 6, 1, 1, 'm']],
  },
  galadriel: {
    base: GOWN,
    map: { H: 'y', C: 'w', T: 'w', B: 'Y' },
    add: [[1, 2, 1, 10, 'y'], [3, 1, 4, 1, 'F'], [9, 8, 1, 1, '.'], [9, 7, 1, 1, 'w'], [9, 6, 1, 1, 'w'], [10, 5, 1, 1, 'w'], [10, 4, 1, 1, 's'],
      [8, -2, 5, 5, 'F'], [9, -1, 3, 3, 'L'], [10, -3, 1, 1, 'L'], [7, 0, 1, 1, 'L'], [13, 0, 1, 1, 'L'], [10, 3, 1, 1, 'L']],
  },
  arwen: {
    base: GOWN,
    map: { H: 'N', C: 'P', T: 'p', B: 'Y' },
    add: [[1, 2, 1, 10, 'N'], [0, 4, 1, 7, 'N'], [5, 7, 1, 1, 'w'], [10, 8, 1, 1, 'P'], [11, 8, 1, 1, 's'], [12, 7, 1, 1, 'Y'], [12, 6, 1, 1, 'm'],
      [13, 5, 1, 1, 'm'], [13, 4, 1, 1, 'm'], [14, 3, 1, 1, 'm'], [14, 2, 1, 1, 'm'], [15, 1, 1, 1, 'm']],
  },
  frodo: {
    base: SHORT,
    map: { H: 'n', C: 'c', T: 't', B: 'l' },
    add: [[8, 7, 1, 1, 'c'], [9, 6, 1, 1, 'c'], [9, 5, 1, 1, 's'], [10, 5, 1, 1, 'Y'], [10, 4, 1, 1, 'b'], [11, 3, 1, 1, 'b'], [11, 2, 1, 1, 'b'], [12, 1, 1, 1, 'b'],
      [12, 0, 1, 1, 'L'], [11, 1, 1, 1, 'L']],
  },
  sam: {
    base: SHORT,
    map: { H: 'n', C: 'T', T: 't', B: 'l' },
    add: [[0, 6, 1, 5, 'l'], [8, 7, 1, 1, '.'], [8, 6, 1, 1, 'T'], [8, 5, 1, 1, 'T'], [8, 4, 1, 1, 's'], [8, 3, 1, 1, 'M'], [8, 2, 1, 1, 'M'],
      [6, -2, 5, 4, 'G'], [7, -3, 3, 1, 'G'], [7, 2, 3, 1, 'G'], [7, -1, 3, 2, 'M']],
  },
  merry: {
    base: SHORT,
    map: { H: 'Y', C: 'C', T: 't', B: 'l' },
    add: [[9, 6, 1, 3, 'Y'], [10, 7, 5, 1, 'm'], [6, 12, 3, 2, '.'], [7, 12, 2, 1, 't'], [8, 13, 3, 1, 's']],
  },
  pippin: {
    base: SHORT,
    map: { H: 'n', C: 'B', T: 't', B: 'l' },
    add: [[8, 7, 1, 1, '.'], [8, 6, 1, 1, 'B'], [8, 5, 1, 1, 'B'], [8, 4, 1, 1, 's'], [8, 3, 1, 1, 'l'], [8, 2, 1, 1, 'l'], [8, 1, 1, 1, 'l'],
      [7, -2, 3, 3, 'f'], [8, -3, 1, 2, 'F'], [8, -1, 1, 1, 'F'], [7, -4, 1, 1, 'f'], [9, -3, 1, 1, 'f']],
  },
  gimli: {
    rows: [
      '..............', '...MMMM.......', '..MMMMMM......', '.MMMMMMMM.....', '..sssses......', '..ossssoo.....',
      '.ooooooooo....', 'MooooooooMs...', 'MMoooooooM....', 'MMMoooooMM....', 'MMMMlllMMM....', 'MMMMMMMMMM....',
      '.MMMMMMMM.....', '.NNN..NNN.....', '.kkk..kkk.....', 'kkkk..kkkk....',
    ],
    add: [[10, 6, 1, 1, 'l'], [11, 5, 1, 1, 'l'], [11, 4, 1, 1, 'l'], [12, 3, 1, 1, 'l'], [12, 2, 1, 1, 'l'], [13, 1, 1, 1, 'l'], [13, 0, 1, 1, 'l'],
      [12, -3, 4, 3, 'M'], [15, -4, 1, 5, 'm'], [12, -2, 1, 1, 'm']],
  },
  orc: {
    rows: [
      '...OOOO.....', '..OOOOOO.m..', '..OOOFOF.m..', '..OOOOOO..m.', '...OwOO...m.', '..xxxxxx.Y..',
      '.xxxxxxxO...', '.xxxxxxx....', '.xxRRRxx....', '.xxxxxxx....', '..xxxxx.....', '..QQ..QQ....',
      '..xx..xx....', '.xxx..xxx...',
    ],
  },
  balrog: {
    rows: [
      '..............Dd.....dD..', '.............dd.......dd.', '............dd..zzzz..dd.', '............d..zzzzzz.d..',
      '............dd.zzEzzEz...', '.........zzzzzzzzzhzzz...', '.......zhFhzzzzzzhfzz....', '.....zzzhfzzzzzzhFFhzz...',
      '....zzzzzhzzzzzzzhfhzzzz.', '...zzzzzzzzzzzzzzzhzzzzzz', '..zzzzhzzzzzzzzzzzzz.zzzz', '...zzzhfhzzzzzzzzzzz.zzZz',
      '....zzzhzzzzzzzzzzz..zzzz', '.....zzzzzzzzzzzzz...hzzh', '.....zzzzzz.zzzzzz...fzzf', '....zzzzz....zzzzz....ff.',
      '....zzfzz....zzhzz.......', '...zzzzz.....zzzzz.......', '...zzhzz......zzzzz......', '..ffffff......ffffff.....',
    ],
  },
  nazgul: { rows: buildNazgul(), shrink: 0.89 },
  sauron: { rows: buildSauron(0), shrink: 0.78 },
  sauronWind: { rows: buildSauron(1), shrink: 0.78 },
};

const gridCache = new Map<SpriteKey, Grid>();

export function getSpriteGrid(key: SpriteKey): Grid {
  const cached = gridCache.get(key);
  if (cached) return cached;

  const definition = SPRITES[key];
  const map = definition.map ?? {};
  const rows = definition.rows ?? (definition.base ?? []).map((row) => [...row].map((ch) => map[ch] ?? ch).join(''));
  const paddingTop = EVIL_SPRITES.includes(key) ? 0 : HERO_PADDING_TOP;
  const width = Math.max(17, ...rows.map((row) => row.length));

  const grid: Grid = [...Array<string>(paddingTop).fill(''), ...rows].map((row) => [...row.padEnd(width, '.')]);

  for (const [x, y, rectWidth, rectHeight, color] of definition.add ?? []) {
    for (let j = y; j < y + rectHeight; j++) {
      for (let i = x; i < x + rectWidth; i++) {
        if (grid[j + paddingTop] && i >= 0 && i < width) grid[j + paddingTop][i] = map[color] ?? color;
      }
    }
  }

  const result = definition.shrink ? shrinkGrid(grid, definition.shrink) : grid;
  gridCache.set(key, result);
  return result;
}