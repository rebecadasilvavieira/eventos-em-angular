import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { environment } from '@environments/environment';
import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-evento-visualizacao',
  templateUrl: './evento-visualizacao.component.html'
})
export class EventoVisualizacaoComponent implements OnInit, OnDestroy {
  evento?: Evento;
  carregando = true;
  erro = false;
  private destruir$ = new Subject<void>();
  constructor(private route: ActivatedRoute, private service: EventoService) {}
  ngOnInit(): void { this.carregar(); }
  carregar(): void {
    this.carregando = true;
    this.erro = false;
    this.service.getEventoById(Number(this.route.snapshot.paramMap.get('id')))
      .pipe(timeout(30000), takeUntil(this.destruir$), finalize(() => this.carregando = false))
      .subscribe(evento => { this.evento = evento; this.erro = !evento; }, () => this.erro = true);
  }
  get imagem(): string {
    return this.evento?.imagemURL ? environment.apiURL + 'resources/Images/' + this.evento.imagemURL : 'assets/img/evento.png';
  }
  ngOnDestroy(): void { this.destruir$.next(); this.destruir$.complete(); }
}
