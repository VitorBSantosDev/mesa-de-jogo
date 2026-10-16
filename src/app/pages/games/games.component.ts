import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game } from '../../models/game.model';
import { GameCardComponent } from '../../components/game-card/game-card.component';

@Component({
  selector: 'app-games',
  imports: [GameCardComponent, RouterLink],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
})

export class GamesComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  games: Game[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.gameService.getAll().subscribe({
      next: (games) => {
        this.games = games;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os jogos. Confirma que a API está a correr.';
        this.isLoading = false;
      },
    });
  }

  goToGame(id: number): void {
    this.router.navigate(['/jogos', id]);
  }
}