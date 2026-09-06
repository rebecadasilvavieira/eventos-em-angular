/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { PalestranteService } from './palestrante.service';

describe('Service: Palestrante', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PalestranteService],
    });
  });

  it('should ...', inject([PalestranteService], (service: PalestranteService) => {
    expect(service).toBeTruthy();
  }));
});
