import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { PalestranteService } from '@app/services/palestrante.service';
import { environment } from '@environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public eventos: Evento[] = [];
  public totalEventos = 0;
  public totalPalestrantes = 0;
  public carregando = true;
  public erro = false;

  constructor(
    private eventoService: EventoService,
    private palestranteService: PalestranteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarResumo();
  }

  public carregarResumo(): void {
    this.carregando = true;
    this.erro = false;

    forkJoin({
      eventos: this.eventoService.getEventos(1, 6),
      palestrantes: this.palestranteService.getPalestrantes(1, 1),
    }).subscribe(
      ({ eventos, palestrantes }) => {
        this.totalEventos = eventos.pagination?.totalItems || eventos.result.length;
        this.totalPalestrantes = palestrantes.pagination?.totalItems || palestrantes.result.length;
        this.eventos = eventos.result
          .filter((evento) => !evento.dataEvento || new Date(evento.dataEvento) >= new Date())
          .sort((a, b) => this.dataEvento(a).getTime() - this.dataEvento(b).getTime())
          .slice(0, 3);
      },
      () => {
        this.erro = true;
      }
    ).add(() => this.carregando = false);
  }

  public dataEvento(evento: Evento): Date {
    return evento.dataEvento ? new Date(evento.dataEvento) : new Date(0);
  }

  public getImagemURL(imagemURL: string): string {
    return imagemURL
      ? `${environment.apiURL}resources/Images/${imagemURL}`
      : './assets/img/evento.png';
  }

  public abrirEvento(id: number): void {
    this.router.navigate(['/eventos', 'detalhe', id]);
  }

}
