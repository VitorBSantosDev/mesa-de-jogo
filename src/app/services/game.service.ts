import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Tables } from '../database/supabase';
import { Game, GameCategory, NewGame } from '../models/game.model';

function mapToGame(row: Tables<'games'>): Game {
  return {
    id: row.id,
    name: row.name,
    category: row.category as GameCategory,
    minPlayers: row.min_players,
    maxPlayers: row.max_players,
    duration: row.duration,
    image: row.image,
  };
}

@Service()
export class GameService {
  private supabase = inject(SupabaseService);

  getAll(): Observable<Game[]> {
    const request = this.supabase.client.from('games').select('*');
    return this.supabase.execute(request).pipe(map((rows) => rows.map(mapToGame)));
  }

  getById(id: number): Observable<Game> {
    const request = this.supabase.client.from('games').select('*').eq('id', id).single();
    return this.supabase.execute(request).pipe(map(mapToGame));
  }

  create(game: NewGame): Observable<Game> {
    const row = {
      name: game.name,
      category: game.category,
      min_players: game.minPlayers,
      max_players: game.maxPlayers,
      duration: game.duration,
      image: game.image,
    };
    const request = this.supabase.client.from('games').insert(row).select().single();
    return this.supabase.execute(request).pipe(map(mapToGame));
  }

  delete(id: number): Observable<void> {
    const request = this.supabase.client.from('games').delete().eq('id', id);
    return this.supabase.execute(request).pipe(map(() => undefined));
  }
}