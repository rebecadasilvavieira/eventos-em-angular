/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { RedesSociaisComponent } from './redesSociais.component';
import { RedeSocialService } from '@app/services/redeSocial.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService } from 'ngx-bootstrap/modal';

describe('RedesSociaisComponent', () => {
  let component: RedesSociaisComponent;
  let fixture: ComponentFixture<RedesSociaisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RedesSociaisComponent],
      providers: [
        {
          provide: RedeSocialService,
          useValue: {
            getRedesSociais: jasmine.createSpy('getRedesSociais').and.returnValue(of([])),
            saveRedesSociais: jasmine.createSpy('saveRedesSociais').and.returnValue(of({})),
            deleteRedeSocial: jasmine.createSpy('deleteRedeSocial').and.returnValue(of({})),
          },
        },
        { provide: ToastrService, useValue: { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') } },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
        { provide: BsModalService, useValue: { show: jasmine.createSpy('show') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedesSociaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
