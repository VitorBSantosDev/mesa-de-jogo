import { Service, inject } from '@angular/core';
import { Observable, debounceTime } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Database } from '../database/supabase';

type TableName = keyof Database['public']['Tables'];

const CHANGES_DELAY = 400;

@Service()

export class RealtimeService {
  private supabase = inject(SupabaseService);
  private channelCount = 0;

  watch(...tables: TableName[]): Observable<void> {
    const changes = new Observable<void>((subscriber) => {
      const channel = this.supabase.client.channel(`alteracoes-${++this.channelCount}`);
      tables.forEach((table) =>
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => subscriber.next()),
      );
      channel.subscribe();

      return () => {
        this.supabase.client.removeChannel(channel);
      };
    });

    return changes.pipe(debounceTime(CHANGES_DELAY));
  }
}