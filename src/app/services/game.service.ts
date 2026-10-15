import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Game, NewGame } from '../models/game.model';

@Service()
export class GameService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/games`;

  getAll(): Observable<Game[]> {
    return this.http.get<Game[]>(this.url);
  }

  getById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.url}/${id}`);
  }

  create(game: NewGame): Observable<Game> {
    return this.http.post<Game>(this.url, game);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}