import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Player } from '../models/player.model';

@Service()
export class PlayerService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/players`;

  getAll(): Observable<Player[]> {
    return this.http.get<Player[]>(this.url);
  }

  create(player: Omit<Player, 'id'>): Observable<Player> {
    return this.http.post<Player>(this.url, player);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}