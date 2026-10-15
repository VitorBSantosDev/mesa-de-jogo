export interface MatchResult {
  playerId: number;
  score: number;
}

export interface Match {
  id: number;
  gameId: number;
  date: string;
  results: MatchResult[];
}

export type NewMatch = Omit<Match, "id">;