import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { EventoService } from '@app/services/evento.service';
import { DateTimeFormatPipe } from '@app/helpers/DateTimeFormat.pipe';
import { EventoListaComponent } from './evento-lista.component';

describe('EventoListaComponent', () => {
  let fixture: ComponentFixture<EventoListaComponent>;
  const resposta = {
    result: [{ id: 7, tema: 'Encontro Angular', local: 'Auditorio', dataEvento: '2026-09-06T10:00:00', qtdPessoas: 100, imagemURL: '', lotes: [] }],
    pagination: { currentPage: 1, itemsPerPage: 3, totalItems: 1, totalPages: 1 }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventoListaComponent, DateTimeFormatPipe],
      imports: [FormsModule, RouterTestingModule, NoopAnimationsModule, CollapseModule.forRoot(), PaginationModule.forRoot(), TooltipModule.forRoot(), ModalModule.forRoot()],
      providers: [
        { provide: EventoService, useValue: { getEventos: () => of(resposta) } },
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: () => {}, hide: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EventoListaComponent);
    fixture.detectChanges();
  });

  it('mostra os eventos retornados na tabela sem abrir o formulario de cadastro', () => {
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Encontro Angular');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('oferece o cadastro separado no link Novo evento', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[routerLink]');
    expect(link.getAttribute('href')).toBe('/eventos/detalhe');
    expect(link.textContent?.toLowerCase()).toContain('novo evento');
  });

  it('abre o detalhe do evento ao clicar na linha', () => {
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    fixture.nativeElement.querySelector('tbody tr').click();
    expect(navegar).toHaveBeenCalledWith(['eventos/detalhe/7']);
  });

  it('abre a confirmacao de exclusao sem navegar para o detalhe', () => {
    const navegar = spyOn(TestBed.inject(Router), 'navigate');
    const modal = spyOn(TestBed.inject(BsModalService), 'show').and.returnValue({ hide: () => {} } as any);
    fixture.nativeElement.querySelector('tbody button').click();
    expect(modal).toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });
});