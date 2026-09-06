import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RedeSocial } from '@app/models/RedeSocial';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { RedeSocialService } from '../../services/redeSocial.service';

@Component({
  selector: 'app-redes-sociais',
  templateUrl: './redesSociais.component.html',
  styleUrls: ['./redesSociais.component.scss'],
})
export class RedesSociaisComponent implements OnInit {
  modalRef!: BsModalRef;

  @Input() eventoId = 0;

  public formRS!: FormGroup;
  public redeSocialAtual = { id: 0, nome: '', indice: 0 };

  public get redesSociais(): FormArray {
    return this.formRS.get('redesSociais') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private redeSocialService: RedeSocialService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.validation();
    this.carregarRedesSociais(this.eventoId);
  }

  private carregarRedesSociais(id: number = 0): void {
    const origem = this.eventoId !== 0 ? 'evento' : 'palestrante';

    this.spinner.show();

    this.redeSocialService
      .getRedesSociais(origem, id)
      .subscribe(
        (redeSocialRetorno: RedeSocial[]) => {
          this.redesSociais.clear();
          redeSocialRetorno.forEach((redeSocial) => {
            this.redesSociais.push(this.criarRedeSocial(redeSocial));
          });
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar carregar Rede Social', 'Erro');
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
  }

  public validation(): void {
    this.formRS = this.fb.group({
      redesSociais: this.fb.array([]),
    });
  }

  adicionarRedeSocial(): void {
    const novaRedeSocial = {
      id: 0,
      nome: '',
      url: '',
      eventoId: this.eventoId,
      palestranteId: 0,
    } as RedeSocial;

    this.redesSociais.push(this.criarRedeSocial(novaRedeSocial));
  }

  criarRedeSocial(redeSocial: RedeSocial): FormGroup {
    return this.fb.group({
      id: [redeSocial.id],
      nome: [redeSocial.nome, Validators.required],
      url: [redeSocial.url, Validators.required],
    });
  }

  public retornaTitulo(nome: string): string {
    const nomes: { [classe: string]: string } = {
      'fab fa-youtube': 'YouTube',
      'fab fa-instagram': 'Instagram',
      'fab fa-facebook': 'Facebook',
      'fab fa-twitter': 'Twitter',
      'fab fa-google': 'Google',
      'fab fa-linkedin': 'LinkedIn',
      'fab fa-pinterest': 'Pinterest',
      'fab fa-whatsapp': 'WhatsApp',
      'fab fa-telegram': 'Telegram',
      'fab fa-skype': 'Skype',
      'fab fa-vimeo': 'Vimeo',
    };

    return nomes[nome] || 'Rede Social';
  }

  public cssValidator(campoForm: FormControl | AbstractControl | null): any {
    return { 'is-invalid': !!(campoForm && campoForm.errors && campoForm.touched) };
  }

  public salvarRedesSociais(): void {
    const origem = this.eventoId !== 0 ? 'evento' : 'palestrante';

    if (this.formRS.get('redesSociais')?.valid) {
      this.spinner.show();
      this.redeSocialService
        .saveRedesSociais(origem, this.eventoId, this.formRS.value.redesSociais)
        .subscribe(
          () => {
            this.toastr.success('Redes Sociais foram salvas com Sucesso!', 'Sucesso!');
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar salvar Redes Sociais.', 'Erro');
            console.error(error);
          }
        )
        .add(() => this.spinner.hide());
    }
  }

  public removerRedeSocial(template: TemplateRef<any>, indice: number): void {
    const controleId = this.redesSociais.get(`${indice}.id`);
    const controleNome = this.redesSociais.get(`${indice}.nome`);

    this.redeSocialAtual.id = controleId ? controleId.value : 0;
    this.redeSocialAtual.nome = this.retornaTitulo(controleNome ? controleNome.value : '');
    this.redeSocialAtual.indice = indice;

    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDeleteRedeSocial(): void {
    const origem = this.eventoId !== 0 ? 'evento' : 'palestrante';
    this.modalRef.hide();
    this.spinner.show();

    this.redeSocialService
      .deleteRedeSocial(origem, this.eventoId, this.redeSocialAtual.id)
      .subscribe(
        () => {
          this.toastr.success('Rede Social deletado com sucesso', 'Sucesso');
          this.redesSociais.removeAt(this.redeSocialAtual.indice);
        },
        (error: any) => {
          this.toastr.error(
            `Erro ao tentar deletar o Rede Social ${this.redeSocialAtual.id}`,
            'Erro'
          );
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
  }

  declineDeleteRedeSocial(): void {
    this.modalRef.hide();
  }
}

