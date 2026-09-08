import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { AccountService } from '@app/services/account.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  public usuario = {} as UserUpdate;
  public file!: File;
  public readonly imagemPadrao = 'assets/img/userlogin.png';
  public imagemURL = this.imagemPadrao;

  public get ehPalestrante(): boolean {
    return this.usuario.funcao === 'Palestrante';
  }

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {

  }

  public setFormValue(usuario: UserUpdate): void {
    this.usuario = usuario;

    if (this.usuario.imagemURL) {
      this.imagemURL = environment.apiURL + `resources/Images/${this.usuario.imagemURL}`;
    } else {
      this.imagemURL = this.imagemPadrao;
    }
  }

  public atualizarPrevia(valor: Pick<UserUpdate, 'primeiroNome' | 'ultimoNome' | 'descricao'>): void {
    this.usuario = { ...this.usuario, ...valor };
  }

  public usarImagemPadrao(event: Event): void {
    const imagem = event.target as HTMLImageElement;
    if (imagem.getAttribute('src') !== this.imagemPadrao) {
      this.imagemURL = this.imagemPadrao;
      imagem.src = this.imagemPadrao;
    }
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();
    const fileList: FileList = ev.target.files as FileList;

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    if (fileList && fileList.length > 0) {
      this.file = fileList[0];
      reader.readAsDataURL(this.file);
      this.uploadImagem();
    }
  }

  private uploadImagem(): void {
    this.spinner.show();
    this.accountService
      .postUpload(this.file)
      .subscribe(
        () => this.toastr.success('Imagem atualizada com Sucesso', 'Sucesso!'),
        (error: any) => {
          this.toastr.error('Erro ao fazer upload de imagem', 'Erro!');
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
  }


}
