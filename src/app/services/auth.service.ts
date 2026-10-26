import { Service, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Service()
export class AuthService {
  private supabase = inject(SupabaseService);

  readonly session = signal<Session | null>(null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly userEmail = computed(() => this.session()?.user.email ?? '');

  constructor() {
    this.supabase.client.auth.onAuthStateChange((_event, session) => this.session.set(session));
  }

  loadSession(): Observable<Session | null> {
    return from(this.supabase.client.auth.getSession()).pipe(
      map(({ data }) => {
        this.session.set(data.session);
        return data.session;
      }),
    );
  }

  signIn(email: string, password: string): Observable<void> {
    return from(this.supabase.client.auth.signInWithPassword({ email, password })).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  signUp(email: string, password: string): Observable<void> {
    const emailRedirectTo = window.location.origin + window.location.pathname;

    return from(this.supabase.client.auth.signUp({ email, password, options: { emailRedirectTo } })).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  signOut(): Observable<void> {
    return from(this.supabase.client.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }
}