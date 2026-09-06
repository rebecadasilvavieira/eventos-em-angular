/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PerfilDetalheComponent } from './perfil-detalhe.component';
import { AccountService } from '@app/services/account.service';
import { PalestranteService } from '@app/services/palestrante.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

describe('PerfilDetalheComponent', () => {
  let component: PerfilDetalheComponent;
  let fixture: ComponentFixture<PerfilDetalheComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [PerfilDetalheComponent],
      providers: [
        {
          provide: AccountService,
          useValue: {
            getUser: jasmine.createSpy('getUser').and.returnValue(of({})),
            updateUser: jasmine.createSpy('updateUser').and.returnValue(of({})),
          },
        },
        {
          provide: PalestranteService,
          useValue: {
            post: jasmine.createSpy('post').and.returnValue(of({})),
          },
        },
        { provide: ToastrService, useValue: { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
