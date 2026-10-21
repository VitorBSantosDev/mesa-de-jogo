import { Service, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Match, MatchResult, NewMatch } from '../models/match.model';

const MATCH_COLUMNS = 'id, game_id, date, match_results(player_id, score)';

interface MatchRow {
  id: number;
  game_id: number;
  date: string;
  match_results: { player_id: number; score: number }[];
}

function mapToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    gameId: row.game_id,
    date: row.date,
    results: row.match_results.map((result) => ({ playerId: result.player_id, score: result.score })),
  };
}

@Service()
export class MatchService {
  private supabase = inject(SupabaseService);

  getAll(): Observable<Match[]> {
    const request = this.supabase.client.from('matches').select(MATCH_COLUMNS);
    return this.supabase.execute(request).pipe(map((rows) => rows.map(mapToMatch)));
  }

  getByGame(gameId: number): Observable<Match[]> {
    const request = this.supabase.client.from('matches').select(MATCH_COLUMNS).eq('game_id', gameId);
    return this.supabase.execute(request).pipe(map((rows) => rows.map(mapToMatch)));
  }

  create(match: NewMatch): Observable<Match> {
    const insertMatch = this.supabase.client
      .from('matches')
      .insert({ game_id: match.gameId, date: match.date })
      .select('id')
      .single();

    return this.supabase.execute(insertMatch).pipe(
      switchMap(({ id }) => {
        const results = match.results.map((result) => ({
          match_id: id,
          player_id: result.playerId,
          score: result.score,
        }));
        const insertResults = this.supabase.client.from('match_results').insert(results);
        return this.supabase.execute(insertResults).pipe(map(() => ({ ...match, id })));
      }),
    );
  }

  getWinnerId(match: Match): number {
    const best = match.results.reduce((playerA, playerB) => (playerB.score > playerA.score ? playerB : playerA));
    return best.playerId;
  }

  sortByScore(match: Match): MatchResult[] {
    return [...match.results].sort((resultA, resultB) => resultB.score - resultA.score);
  }
}