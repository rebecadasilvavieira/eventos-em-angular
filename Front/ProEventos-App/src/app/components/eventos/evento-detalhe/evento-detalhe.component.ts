import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';
import { formatarTelefone } from '@app/helpers/telefone';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

import { LoteService } from './../../../services/lote.service';
import { EventoService } from '@app/services/evento.service';
import { Evento } from '@app/models/Evento';
import { Lote } from '@app/models/Lote';
import { DatePipe } from '@angular/common';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
  providers: [DatePipe],
})
export class EventoDetalheComponent implements OnInit, OnDestroy {
  private readonly destruir$ = new Subject<void>();
  modalRef!: BsModalRef;
  eventoId!: number;
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvar: 'post' | 'put' = 'post';
  loteAtual = { id: 0, nome: '', indice: 0 };
  imagemURL = 'assets/img/upload.png';
  file!: File;

  get modoEditar(): boolean {
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false,
    };
  }

  constructor(
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private activatedRouter: ActivatedRoute,
    private eventoService: EventoService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private router: Router,
    private loteService: LoteService,
    private datePipe: DatePipe
  ) {
    this.localeService.use('pt-br');
  }

  ngOnInit(): void {
    this.validation();
    this.carregarEvento();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
    this.spinner.hide();
  }

  public carregarEvento(): void {
    const id = this.activatedRouter.snapshot.paramMap.get('id');
    this.eventoId = id ? Number(id) : 0;

    if (this.eventoId !== 0) {
      this.spinner.show();
      this.estadoSalvar = 'put';

      this.eventoService
        .getEventoById(this.eventoId)
      .pipe(timeout(30000), takeUntil(this.destruir$), finalize(() => this.spinner.hide()))
        .subscribe(
          (evento: Evento) => {
            this.evento = { ...evento };

            if (this.evento.telefone) {
              this.evento.telefone = formatarTelefone(this.evento.telefone);
            }

            this.form.patchValue(this.evento);

            if (this.evento.imagemURL !== '') {
              this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
            }
            this.carregarLotes();
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar carregar Evento.', 'Erro!');
            console.error(error);
          }
        );
    }
  }

  public carregarLotes(): void {
    this.loteService
      .getLotesById(this.eventoId)
      .pipe(timeout(30000), takeUntil(this.destruir$))
      .subscribe(
        (lotesRetorno: Lote[]) => {
          this.atualizarLotes(lotesRetorno);
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar carregar lotes', 'Erro');
          console.error(error);
        }
      );
  }

  private atualizarLotes(lotes: Lote[]): void {
    this.lotes.clear();
    lotes.forEach(lote => this.lotes.push(this.criarLote(lote)));
    this.evento.lotes = lotes;
    this.lotes.markAsPristine();
  }

  public onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFormatado = formatarTelefone(input.value);

    input.value = valorFormatado;
    this.form.get('telefone')?.setValue(valorFormatado, { emitEvent: false });
    this.evento.telefone = valorFormatado;
  }

  public validation(): void {
    this.form = this.fb.group({
      tema: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: [''],
      lotes: this.fb.array([]),
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({ id: 0 } as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      quantidade: [lote.quantidade, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
    });
  }

  public mudarValorData(value: Date, indice: number, campo: string): void {
    this.lotes.at(indice).get(campo)?.setValue(value);
  }

  public retornaTituloLote(nome: string): string {
    return nome === null || nome === '' ? 'Nome do lote' : nome;
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: AbstractControl | null): object {
    return {
      'is-invalid': !!campoForm?.errors && !!campoForm?.touched
    };
  }

  public salvarEvento(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Preencha os campos obrigat?rios do evento e dos lotes antes de salvar.');
      return;
    }

    this.evento = this.estadoSalvar === 'post'
      ? { ...this.form.value }
      : { id: this.evento.id, ...this.form.value };
    const salvarEvento$ = this.estadoSalvar === 'post'
      ? this.eventoService.post(this.evento)
      : this.eventoService.put(this.evento);

    this.spinner.show();
    salvarEvento$.pipe(
      timeout(30000),
      takeUntil(this.destruir$),
      finalize(() => this.spinner.hide())
    ).subscribe(
      (eventoRetorno: Evento) => {
        this.toastr.success('Evento salvo com Sucesso!', 'Sucesso');
        this.router.navigate(['eventos/detalhe/' + eventoRetorno.id]);
      },
      (error: any) => {
        console.error(error);
        this.toastr.error('N?o foi poss?vel confirmar o salvamento. Confira o evento antes de tentar novamente.', 'Erro');
      }
    );
  }

  public salvarLotes(): void {
    if (this.form.controls.lotes.valid) {
      this.spinner.show();
      this.loteService
        .saveLote(this.eventoId, this.form.value.lotes)
      .pipe(timeout(30000), takeUntil(this.destruir$), finalize(() => this.spinner.hide()))
        .subscribe(
          (lotesRetorno: Lote[]) => {
            this.atualizarLotes(lotesRetorno);
            this.toastr.success('Lotes salvos com Sucesso!', 'Sucesso!');
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar salvar lotes.', 'Erro');
            console.error(error);
          }
        );
    }
  }

  public removerLote(template: TemplateRef<any>, indice: number): void {
    this.loteAtual.id = this.lotes.get(indice + '.id')?.value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome')?.value;
    this.loteAtual.indice = indice;

    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDeleteLote(): void {
    this.modalRef.hide();
    this.spinner.show();

    this.loteService
      .deleteLote(this.eventoId, this.loteAtual.id)
      .pipe(timeout(30000), takeUntil(this.destruir$), finalize(() => this.spinner.hide()))
      .subscribe(
        () => {
          this.toastr.success('Lote deletado com sucesso', 'Sucesso');
          this.lotes.removeAt(this.loteAtual.indice);
        },
        (error: any) => {
          this.toastr.error(
            `Erro ao tentar deletar o Lote ${this.loteAtual.id}`,
            'Erro'
          );
          console.error(error);
        }
      );
  }

  declineDeleteLote(): void {
    this.modalRef.hide();
  }

  onFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.file = file;
    const reader = new FileReader();

    reader.onload = () => this.imagemURL = reader.result as string;
    reader.readAsDataURL(file);

    this.uploadImagem();
  }

  uploadImagem(): void {
    this.spinner.show();
    this.eventoService.postUpload(this.eventoId, this.file)
      .pipe(timeout(30000), takeUntil(this.destruir$), finalize(() => this.spinner.hide())).subscribe(
      () => {
        this.carregarEvento();
        this.toastr.success('Imagem atualizada com Sucesso', 'Sucesso!');
      },
      (error: any) => {
        this.toastr.error('Erro ao fazer upload de imagem', 'Erro!');
        console.log(error);
      }
    );
  }
}
