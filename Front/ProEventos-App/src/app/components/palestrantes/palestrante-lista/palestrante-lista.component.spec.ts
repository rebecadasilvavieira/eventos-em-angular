/// <reference types="jasmine" />
/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PalestranteListaComponent } from './palestrante-lista.component';
import { PalestranteService } from '@app/services/palestrante.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService } from 'ngx-bootstrap/modal';

describe('PalestranteListaComponent', () => {
  let component: PalestranteListaComponent;
  let fixture: ComponentFixture<PalestranteListaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PalestranteListaComponent],
      providers: [
        {
          provide: PalestranteService,
          useValue: {
            getPalestrantes: jasmine.createSpy('getPalestrantes').and.returnValue(of({ result: [], pagination: {} })),
          },
        },
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
        { provide: BsModalService, useValue: { show: jasmine.createSpy('show') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalestranteListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
