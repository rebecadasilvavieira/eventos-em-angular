import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environments/environment';
import { Lote } from '@app/models/Lote';
import { LoteService } from './lote.service';

describe('LoteService', () => {
  let service: LoteService;
  let http: HttpTestingController;
  const url = environment.apiURL + 'api/lotes';
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [LoteService] });
    service = TestBed.inject(LoteService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('carrega os lotes pela rota de evento da API', () => {
    const lotes = [{ id: 8, nome: 'Primeiro lote' }] as Lote[];
    service.getLotesById(7).subscribe(resultado => expect(resultado).toEqual(lotes));
    const req = http.expectOne(url + '/7/eventoId');
    expect(req.request.method).toBe('GET');
    req.flush(lotes);
  });

  it('trata resposta sem conteudo como lista vazia', () => {
    service.getLotesById(7).subscribe(resultado => expect(resultado).toEqual([]));
    http.expectOne(url + '/7/eventoId').flush(null, { status: 204, statusText: 'No Content' });
  });

  it('envia uma lista e recebe os IDs salvos', () => {
    const novos = [{ id: 0, nome: 'Primeiro lote' }] as Lote[];
    const salvos = [{ id: 8, nome: 'Primeiro lote' }] as Lote[];
    service.saveLote(7, novos).subscribe(resultado => expect(resultado).toEqual(salvos));
    const req = http.expectOne(url + '/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(novos);
    req.flush(salvos);
  });
});
