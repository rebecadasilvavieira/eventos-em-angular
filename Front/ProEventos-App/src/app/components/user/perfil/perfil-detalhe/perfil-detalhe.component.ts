import { formatarNome } from '@app/helpers/formatarNome';
import { formatarTelefone } from '@app/helpers/telefone';
import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorField } from '@app/helpers/ValidatorField';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { AccountService } from '@app/services/account.service';
import { PalestranteService } from '@app/services/palestrante.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-perfil-detalhe',
  templateUrl: './perfil-detalhe.component.html',
  styleUrls: ['./perfil-detalhe.component.scss']
})
export class PerfilDetalheComponent implements OnInit, OnDestroy {
  private readonly destruir$ = new Subject<void>();
  @Output() previewChange = new EventEmitter<Pick<UserUpdate, 'primeiroNome' | 'ultimoNome' | 'descricao'>>();
  @Output() changeFormValue = new EventEmitter();

  userUpdate = {} as UserUpdate;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public accountService: AccountService,
    public palestranteService: PalestranteService,
    private router: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  public formatarNome(): void {
    formatarNome(this.form);
  }

  ngOnInit(): void {
    this.validation();
    this.form.valueChanges.pipe(takeUntil(this.destruir$)).subscribe(valor => {
      this.previewChange.emit({
        primeiroNome: valor.primeiroNome || '',
        ultimoNome: valor.ultimoNome || '',
        descricao: valor.descricao || ''
      });
    });
    this.carregarUsuario();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  private carregarUsuario(): void {
    this.spinner.show();
    this.accountService
      .getUser()
      .subscribe(
        (userRetorno: UserUpdate) => {
          console.log(userRetorno);
          this.userUpdate = { ...userRetorno, phoneNumber: formatarTelefone(userRetorno.phoneNumber) };
          this.form.patchValue(this.userUpdate);
          this.changeFormValue.emit({ ...this.userUpdate });
          this.toaster.success('Usuário Carregado', 'Sucesso');
        },
        (error: any) => {
          console.error(error);
          this.toaster.error('Usuário não Carregado', 'Erro');
          this.router.navigate(['/dashboard']);
        }
      )
      .add(() => this.spinner.hide());
  }

  private validation(): void {
    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('password', 'confirmePassword'),
    };

    this.form = this.fb.group(
      {
        userName: [''],
        imagemURL: [''],
        titulo: ['NaoInformado', Validators.required],
        primeiroNome: ['', Validators.required],
        ultimoNome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required]],
        descricao: ['', Validators.required],
        funcao: ['NaoInformado', Validators.required],
        password: ['', [Validators.minLength(4), Validators.nullValidator]],
        confirmePassword: ['', Validators.nullValidator],
      },
      formOptions
    );
  }

  // Conveniente para pegar um FormField apenas com a letra F
  get f(): any {
    return this.form.controls;
  }

  onSubmit(): void {
    this.atualizarUsuario();
  }

  public atualizarUsuario(): void {
    this.formatarNome();
    this.f.phoneNumber.setValue(formatarTelefone(this.f.phoneNumber.value));
    const dadosPerfil = { ...this.form.value };
    this.spinner.show();

    const salvarPerfil = this.f.funcao.value === 'Palestrante'
      ? this.palestranteService.post().pipe(
          switchMap(() => this.accountService.updateUser(dadosPerfil))
        )
      : this.accountService.updateUser(dadosPerfil);

    salvarPerfil
      .pipe(switchMap(() => this.accountService.getUser()))
      .subscribe(
        (usuario: UserUpdate) => {
          this.userUpdate = usuario;
          this.changeFormValue.emit({ ...this.userUpdate });
          this.toaster.success('Usuário atualizado!', 'Sucesso');
        },
        (error: any) => {
          this.toaster.error('Não foi possível atualizar o perfil.');
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
  }

  public onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFormatado = formatarTelefone(input.value);
    input.value = valorFormatado;
    this.f.phoneNumber.setValue(valorFormatado, { emitEvent: false });
  }

  public resetForm(event: any): void {
    event.preventDefault();
    this.form.reset({ ...this.userUpdate, password: '', confirmePassword: '' });
  }

}
