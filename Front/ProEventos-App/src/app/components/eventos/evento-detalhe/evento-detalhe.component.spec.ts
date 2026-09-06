import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EventoService } from '@app/services/evento.service';
import { LoteService } from '@app/services/lote.service';

import { EventoDetalheComponent } from './evento-detalhe.component';

describe('EventoDetalheComponent', () => {
  let component: EventoDetalheComponent;
  let fixture: ComponentFixture<EventoDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventoDetalheComponent ],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot(), ModalModule.forRoot(), DatepickerModule.forRoot(), NgxSpinnerModule],
      providers: [EventoService, LoteService, {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => null}}}}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
