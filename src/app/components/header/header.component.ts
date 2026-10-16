import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  links = [
    { path: '/', label: 'Classificação' },
    { path: '/jogos', label: 'Jogos' },
    { path: '/jogadores', label: 'Jogadores' },
    { path: '/partidas', label: 'Partidas' },
  ];
}