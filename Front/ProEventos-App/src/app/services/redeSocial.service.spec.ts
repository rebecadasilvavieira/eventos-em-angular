/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RedeSocialService } from './redeSocial.service';

describe('Service: RedeSocial', () => {
  let service: RedeSocialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RedeSocialService],
    });

    service = TestBed.inject(RedeSocialService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
