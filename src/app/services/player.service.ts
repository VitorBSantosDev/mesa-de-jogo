import { Service, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Player, PlayerAvatar } from '../models/player.model';

const PLAYER_COLUMNS = 'id, name, characters(avatar)';

interface PlayerRow {
  id: number;
  name: string;
  characters: { avatar: string };
}

function mapToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    avatar: row.characters.avatar as PlayerAvatar,
  };
}

@Service()
export class PlayerService {
  private supabase = inject(SupabaseService);

  getAll(): Observable<Player[]> {
    const request = this.supabase.client.from('players').select(PLAYER_COLUMNS);
    return this.supabase.execute(request).pipe(map((rows) => rows.map(mapToPlayer)));
  }

  create(player: Omit<Player, 'id'>): Observable<Player> {
    return this.findCharacterId(player.avatar).pipe(
      switchMap((characterId) => {
        const request = this.supabase.client
          .from('players')
          .insert({ name: player.name, character_id: characterId })
          .select(PLAYER_COLUMNS)
          .single();
        return this.supabase.execute(request);
      }),
      map(mapToPlayer),
    );
  }

  update(id: number, player: Omit<Player, 'id'>): Observable<Player> {
    return this.findCharacterId(player.avatar).pipe(
      switchMap((characterId) => {
        const request = this.supabase.client
          .from('players')
          .update({ name: player.name, character_id: characterId })
          .eq('id', id)
          .select(PLAYER_COLUMNS)
          .single();
        return this.supabase.execute(request);
      }),
      map(mapToPlayer),
    );
  }

  delete(id: number): Observable<void> {
    const request = this.supabase.client.from('players').delete().eq('id', id);
    return this.supabase.execute(request).pipe(map(() => undefined));
  }

  private findCharacterId(avatar: PlayerAvatar): Observable<number> {
    const request = this.supabase.client.from('characters').select('id').eq('avatar', avatar).single();
    return this.supabase.execute(request).pipe(map((character) => character.id));
  }
}