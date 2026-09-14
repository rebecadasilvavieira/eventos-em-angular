import { AccountService } from '@app/services/account.service';
import { Component, OnInit } from '@angular/core';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { PalestranteService } from '@app/services/palestrante.service';
import { environment } from '@environments/environment';
import { forkJoin } from 'rxjs';
import { timeout } from 'rxjs/operators';

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
    public account: AccountService
  ) { }

  ngOnInit(): void {
    this.account.getUser().subscribe({ error: () => {} });
    this.carregarResumo();
  }

  public carregarResumo(): void {
    this.carregando = true;
    this.erro = false;

    forkJoin({
      eventos: this.eventoService.getEventos(1, 5).pipe(timeout(30000)),
      palestrantes: this.palestranteService.getPalestrantes(1, 1),
    }).subscribe(
      ({ eventos, palestrantes }) => {
        this.totalEventos = eventos.pagination?.totalItems || eventos.result.length;
        this.totalPalestrantes = palestrantes.pagination?.totalItems || palestrantes.result.length;
        this.eventos = eventos.result.slice(0, 5);
      },
      () => {
        this.erro = true;
      }
    ).add(() => this.carregando = false);
  }

  public dataEvento(evento: Evento): Date {
    if (!evento.dataEvento) return new Date(NaN);
    const data = String(evento.dataEvento);
    const brasileira = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(data);
    if (brasileira) {
      const [, dia, mes, ano, hora = '0', minuto = '0', segundo = '0'] = brasileira;
      return new Date(+ano, +mes - 1, +dia, +hora, +minuto, +segundo);
    }
    return new Date(data);
  }

  public getImagemURL(imagemURL: string): string {
    return imagemURL
      ? `${environment.apiURL}resources/Images/${imagemURL}`
      : './assets/img/evento.png';
  }


}
