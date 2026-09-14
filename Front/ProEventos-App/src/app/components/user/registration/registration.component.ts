import { formatarNome } from '@app/helpers/formatarNome';
import { usuarioUnico } from '@app/helpers/usuario-unico';
import { ValidatorField } from './../../../helpers/ValidatorField';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { User } from '@app/models/identity/User';
import { AccountService } from '@app/services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  user = {} as User;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private toaster: ToastrService
  ) { }

  get f(): any {
    return this.form.controls;
  }

  public formatarNome(): void {
    formatarNome(this.form);
  }

  ngOnInit(): void {
    this.validation();
  }

  private validation(): void {
    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch(
        'password',
        'confirmePassword'
      )
    };

    this.form = this.fb.group({
      primeiroNome: ['', Validators.required],
      ultimoNome: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      userName: ['', Validators.required, usuarioUnico(this.accountService)],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmePassword: ['', Validators.required]
    }, formOptions);
  }

 register(): void {
  this.form.markAllAsTouched();
  if (this.form.invalid || this.form.pending) return;

  this.formatarNome();
  this.user = { ...this.form.value };


  this.accountService.register(this.user).subscribe(
    () => {
      console.log('CADASTRO REALIZADO');
      this.router.navigateByUrl('/dashboard');
    },
    (error: any) => {
      if (error.status === 409) this.f.userName.setErrors({ usuarioExiste: true });
      console.error('ERRO COMPLETO:', error);
      console.error('ERRO DA API:', error.error);
      this.toaster.error(error.error);
    }
  );
}}
