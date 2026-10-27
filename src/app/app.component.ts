import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ToastsComponent } from './components/toasts/toasts.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ToastsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class App {}