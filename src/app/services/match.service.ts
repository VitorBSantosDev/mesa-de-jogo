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

function mapToResultRows(matchId: number, results: MatchResult[]) {
  return results.map((result) => ({
    match_id: matchId,
    player_id: result.playerId,
    score: result.score,
  }));
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

  getById(id: number): Observable<Match> {
    const request = this.supabase.client.from('matches').select(MATCH_COLUMNS).eq('id', id).single();
    return this.supabase.execute(request).pipe(map(mapToMatch));
  }

  create(match: NewMatch): Observable<Match> {
    const insertMatch = this.supabase.client
      .from('matches')
      .insert({ game_id: match.gameId, date: match.date })
      .select('id')
      .single();

    return this.supabase.execute(insertMatch).pipe(
      switchMap(({ id }) => {
        const insertResults = this.supabase.client.from('match_results').insert(mapToResultRows(id, match.results));
        return this.supabase.execute(insertResults).pipe(map(() => ({ ...match, id })));
      }),
    );
  }

  update(id: number, match: NewMatch): Observable<Match> {
    const updateMatch = this.supabase.client
      .from('matches')
      .update({ game_id: match.gameId, date: match.date })
      .eq('id', id);
    const deleteResults = this.supabase.client.from('match_results').delete().eq('match_id', id);
    const insertResults = this.supabase.client.from('match_results').insert(mapToResultRows(id, match.results));

    return this.supabase.execute(updateMatch).pipe(
      switchMap(() => this.supabase.execute(deleteResults)),
      switchMap(() => this.supabase.execute(insertResults)),
      map(() => ({ ...match, id })),
    );
  }

  delete(id: number): Observable<void> {
    const request = this.supabase.client.from('matches').delete().eq('id', id);
    return this.supabase.execute(request).pipe(map(() => undefined));
  }
}
