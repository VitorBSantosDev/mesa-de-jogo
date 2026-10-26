export type Grid = string[][];
export type Point = [x: number, y: number];

export const PX = {
  s: '#e9b98c', e: '#1a1410', k: '#1a1410', w: '#ecebe4', g: '#9aa1aa', G: '#5d646d',
  y: '#e8c766', Y: '#c99a2e', n: '#7a4a24', N: '#3e2716', o: '#c0602a', c: '#4f8a3f', C: '#2f5a28',
  t: '#b0905c', T: '#7d6440', b: '#8fd0ff', B: '#4f73b8', p: '#7d5cc0', P: '#4a3470',
  r: '#b0303c', R: '#6e1c26', m: '#d2d8de', M: '#7b848e', l: '#7a5230', f: '#ff8a2a', F: '#ffd75e',
  L: '#fff6cf', x: '#2a2631', X: '#55505f', E: '#ff4a2a', H: '#bfeedd',
  O: '#5f7034', Q: '#3d4a1f', z: '#2a1210', Z: '#4a1c12',
  a: '#232229', A: '#43444d', j: '#8f929c', v: '#5e4239', d: '#7d6c68', i: '#b5381c', D: '#a8968f', h: '#b5381c',
};

const COLORS: Record<string, string> = PX;

function getPixelColor(ch: string, i: number, j: number, frame: number): string {
  if (frame && ch === 'E') return '#ffb347';
  if (frame && ch === 'f') return PX.F;
  if (frame && ch === 'F') return PX.L;
  if (frame && ch === 'H') return PX.w;
  if (ch === 'h' && (i + j + frame) % 2) return PX.f;
  return COLORS[ch];
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  x: number,
  baseline: number,
  flip: boolean,
  frame: number,
  scale = 1,
): void {
  const height = grid.length;
  const width = grid[0].length;

  grid.forEach((row, j) =>
    row.forEach((ch, i) => {
      if (ch === '.') return;
      ctx.fillStyle = getPixelColor(ch, i, j, frame);
      ctx.fillRect(x + (flip ? width - 1 - i : i) * scale, baseline - (height - j) * scale, scale, scale);
    }),
  );
}

export function drawDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string): void {
  ctx.fillStyle = color;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius + radius) ctx.fillRect(cx + x, cy + y, 1, 1);
    }
  }
}

export function createPixelCanvas(width: number, height: number) {
  const grid: Grid = Array.from({ length: height }, () => Array(width).fill('.'));

  const plot = (x: number, y: number, color: string) => {
    if (grid[y] && x >= 0 && x < width) grid[y][x] = color;
  };

  const line = (x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= steps; k++) {
      for (let tx = 0; tx < thickness; tx++) {
        for (let ty = 0; ty < thickness; ty++) {
          plot(Math.round(x0 + ((x1 - x0) * k) / steps) + tx, Math.round(y0 + ((y1 - y0) * k) / steps) + ty, color);
        }
      }
    }
  };

  const polygon = (points: Point[], color: string) =>
    grid.forEach((row, y) =>
      row.forEach((_, x) => {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const [xi, yi] = points[i];
          const [xj, yj] = points[j];
          if (yi > y + 0.5 !== yj > y + 0.5 && x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) row[x] = color;
      }),
    );

  const highlightEdges = (from: string, to: string) => {
    const copy = grid.map((row) => [...row]);
    copy.forEach((row, y) =>
      row.forEach((ch, x) => {
        const isTopEdge = !copy[y - 1] || copy[y - 1][x] === '.';
        const isFrontEdge = copy[y][x + 1] === undefined || copy[y][x + 1] === '.';
        if (ch === from && (isTopEdge || isFrontEdge)) grid[y][x] = to;
      }),
    );
  };

  const toRows = () => grid.map((row) => row.join(''));

  return { grid, plot, line, polygon, highlightEdges, toRows };
}

const DETAIL_ORDER = 'EHwmjfFRiAXvaxke';

export function shrinkGrid(grid: Grid, factor: number): Grid {
  const height = grid.length;
  const width = grid[0].length;

  return Array.from({ length: Math.round(height * factor) }, (_, y) =>
    Array.from({ length: Math.round(width * factor) }, (_, x) => {
      let best = '.';
      let bestRank = DETAIL_ORDER.length;
      for (let j = Math.floor(y / factor); j < Math.min(height, Math.floor((y + 1) / factor)); j++) {
        for (let i = Math.floor(x / factor); i < Math.min(width, Math.floor((x + 1) / factor)); i++) {
          const ch = grid[j][i];
          const rank = DETAIL_ORDER.indexOf(ch);
          if (ch !== '.' && (best === '.' || (rank >= 0 && rank < bestRank))) {
            best = ch;
            bestRank = rank < 0 ? DETAIL_ORDER.length : rank;
          }
        }
      }
      return best;
    }),
  );
}