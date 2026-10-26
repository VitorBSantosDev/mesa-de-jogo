import { Service } from '@angular/core';
import { PostgrestError, createClient } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Database } from '../database/supabase';

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

@Service()
export class SupabaseService {
  readonly client = createClient<Database>(environment.supabaseUrl, environment.supabaseKey, {
    auth: { flowType: 'pkce' },
  });

  execute<T>(request: PromiseLike<SupabaseResponse<T>>): Observable<T> {
    return from(request).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as T;
      }),
    );
  }
}