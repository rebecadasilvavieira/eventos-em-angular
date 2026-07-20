import { Component, importProvidersFrom, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { Palestrantes } from "./palestrantes/palestrantes";
import { Eventos } from "./eventos/eventos";
import { Nav } from './nav/nav';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Eventos,
    // Palestrantes,
    Nav,
    CommonModule,
    FormsModule

  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('ProEventos-App');
}
