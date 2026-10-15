import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match, NewMatch } from '../models/match.model';

@Service()
export class MatchService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/matches`;

  getAll(): Observable<Match[]> {
    return this.http.get<Match[]>(this.url);
  }

  getByGame(gameId: number): Observable<Match[]> {
    return this.http.get<Match[]>(this.url, { params: { gameId } });
  }

  create(match: NewMatch): Observable<Match> {
    return this.http.post<Match>(this.url, match);
  }
}