export function calculateWinRate(wins: number, played: number): number {
  return played ? Math.round((wins / played) * 100) : 0;
}
