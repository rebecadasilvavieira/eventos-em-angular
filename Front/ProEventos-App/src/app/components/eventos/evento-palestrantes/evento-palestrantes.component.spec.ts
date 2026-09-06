import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@environments/environment';
import { EventoPalestrantesComponent } from './evento-palestrantes.component';

describe('Palestrantes do evento', () => {
  let fixture: ComponentFixture<EventoPalestrantesComponent>;
  let http: HttpTestingController;
  let component: EventoPalestrantesComponent;
  const url = environment.apiURL + 'api/eventos/7/palestrantes';
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventoPalestrantesComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: ToastrService, useValue: { success: () => {}, error: () => {} } }]
    }).compileComponents();
    fixture = TestBed.createComponent(EventoPalestrantesComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    component.eventoId = 7;
    component.ngOnChanges();
    http.expectOne(url).flush([{ id: 2, nome: 'Ana Silva', associado: false }, { id: 3, nome: 'Joao Lima', associado: true }]);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('mostra os vinculados e oferece somente os disponiveis na selecao', () => {
    expect(fixture.nativeElement.querySelector('ul').textContent).toContain('Joao Lima');
    expect(fixture.nativeElement.querySelector('select').textContent).toContain('Ana Silva');
    expect(fixture.nativeElement.querySelector('select').textContent).not.toContain('Joao Lima');
  });

  it('salva a associacao e impede cliques duplicados durante a requisicao', () => {
    component.selecionado = 2;
    component.adicionar();
    component.adicionar();
    const req = http.expectOne(url + '/2');
    expect(req.request.method).toBe('PUT');
    expect(component.associados.length).toBe(1);
    req.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();
    expect(component.associados.length).toBe(2);
    expect(component.selecionado).toBe(0);
    expect(fixture.nativeElement.querySelector('ul').textContent).toContain('Ana Silva');
  });

  it('remove somente o vinculo e devolve o palestrante a selecao', () => {
    component.remover(component.associados[0]);
    const req = http.expectOne(url + '/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(component.associados.length).toBe(0);
    expect(component.disponiveis.length).toBe(2);
  });

  it('preserva a selecao quando o salvamento falha', () => {
    component.selecionado = 2;
    component.adicionar();
    http.expectOne(url + '/2').flush({}, { status: 500, statusText: 'Error' });
    expect(component.selecionado).toBe(2);
    expect(component.associados.length).toBe(1);
    expect(component.salvando).toBeFalse();
  });

  it('oferece tentar novamente quando nao consegue carregar', () => {
    component.carregar();
    http.expectOne(url).flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Tentar novamente');
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
  });
});
