/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PalestranteDetalheComponent } from './palestrante-detalhe.component';
import { PalestranteService } from '@app/services/palestrante.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

describe('PalestranteDetalheComponent', () => {
  let component: PalestranteDetalheComponent;
  let fixture: ComponentFixture<PalestranteDetalheComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PalestranteDetalheComponent],
      providers: [
        {
          provide: PalestranteService,
          useValue: {
            getPalestrante: jasmine.createSpy('getPalestrante').and.returnValue(of({ miniCurriculo: '' })),
            put: jasmine.createSpy('put').and.returnValue(of({})),
          },
        },
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalestranteDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
