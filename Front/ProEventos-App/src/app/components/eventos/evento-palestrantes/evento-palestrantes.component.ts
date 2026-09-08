import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

export interface PalestranteOpcao {
  id: number;
  nome: string;
  associado: boolean;
}

@Component({
  selector: 'app-evento-palestrantes',
  templateUrl: './evento-palestrantes.component.html',
  styleUrls: ['./evento-palestrantes.component.scss']
})
export class EventoPalestrantesComponent implements OnChanges {
  @Input() eventoId = 0;
  palestrantes: PalestranteOpcao[] = [];
  selecionado = 0;
  carregando = false;
  salvando = false;
  erroCarregamento = false;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  get url(): string { return environment.apiURL + 'api/eventos/' + this.eventoId + '/palestrantes'; }
  get associados(): PalestranteOpcao[] { return this.palestrantes.filter(p => p.associado); }
  get disponiveis(): PalestranteOpcao[] { return this.palestrantes.filter(p => !p.associado); }

  ngOnChanges(): void {
    this.palestrantes = [];
    this.selecionado = 0;
    if (this.eventoId) this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.http.get<PalestranteOpcao[]>(this.url).pipe(finalize(() => this.carregando = false)).subscribe(
      palestrantes => this.palestrantes = palestrantes || [],
      () => this.erroCarregamento = true
    );
  }

  adicionar(): void {
    const palestrante = this.disponiveis.find(p => p.id === this.selecionado);
    if (!palestrante || this.salvando || this.carregando) return;
    this.salvando = true;
    this.http.put<void>(this.url + '/' + palestrante.id, {}).pipe(finalize(() => this.salvando = false)).subscribe(
      () => {
        palestrante.associado = true;
        this.selecionado = 0;
        this.toastr.success('Palestrante adicionado ao evento.');
      },
      () => this.toastr.error('Não foi possível adicionar o palestrante. Tente novamente.')
    );
  }

  remover(palestrante: PalestranteOpcao): void {
    if (this.salvando || this.carregando) return;
    this.salvando = true;
    this.http.delete<void>(this.url + '/' + palestrante.id).pipe(finalize(() => this.salvando = false)).subscribe(
      () => {
        palestrante.associado = false;
        this.toastr.success('Vínculo com o palestrante removido.');
      },
      () => this.toastr.error('Não foi possível remover o vínculo. Tente novamente.')
    );
  }
}
