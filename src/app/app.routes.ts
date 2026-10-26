import { Routes } from '@angular/router';
import { RankingComponent } from './pages/ranking/ranking.component';
import { GamesComponent } from './pages/games/games.component';
import { GameNewComponent } from './pages/game-new/game-new.component';
import { GameDetailComponent } from './pages/game-detail/game-detail.component';
import { PlayersComponent } from './pages/players/players.component';
import { MatchesComponent } from './pages/matches/matches.component';
import { MatchNewComponent } from './pages/match-new/match-new.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: RankingComponent, title: 'Classificação · Mesa de Jogo' },
  { path: 'jogos', component: GamesComponent, title: 'Jogos · Mesa de Jogo' },
  { path: 'jogos/novo', component: GameNewComponent, canActivate: [authGuard], title: 'Adicionar jogo · Mesa de Jogo' },
  { path: 'jogos/:id/editar', component: GameNewComponent, canActivate: [authGuard], title: 'Editar jogo · Mesa de Jogo' },
  { path: 'jogos/:id', component: GameDetailComponent, title: 'Jogo · Mesa de Jogo' },
  { path: 'jogadores', component: PlayersComponent, title: 'Jogadores · Mesa de Jogo' },
  { path: 'partidas', component: MatchesComponent, title: 'Partidas · Mesa de Jogo' },
  { path: 'partidas/nova', component: MatchNewComponent, canActivate: [authGuard], title: 'Nova partida · Mesa de Jogo' },
  { path: 'partidas/:id/editar', component: MatchNewComponent, canActivate: [authGuard], title: 'Editar partida · Mesa de Jogo' },
  { path: 'login', component: LoginComponent, title: 'Entrar · Mesa de Jogo' },
  { path: 'criar-conta', component: RegisterComponent, title: 'Criar conta · Mesa de Jogo' },
  { path: '**', redirectTo: '' },
];