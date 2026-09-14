/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccountService } from '@app/services/account.service';
import { of } from 'rxjs';
import { environment } from '@environments/environment';

import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfilComponent ],
      imports: [HttpClientTestingModule, ToastrModule.forRoot(), NgxSpinnerModule, TabsModule.forRoot()],
      providers: [AccountService],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('usa a foto retornada pelo servidor depois do upload', () => {
    const reader = { onload: null as any, readAsDataURL: () => reader.onload({ target: { result: 'data:image/png;base64,teste' } }) };
    spyOn(window, 'FileReader').and.returnValue(reader as any);
    spyOn(TestBed.inject(AccountService), 'postUpload').and.returnValue(of({ imagemURL: 'nova.png' } as any));
    component.onFileChange({ target: { files: [new File(['foto'], 'foto.png')] } });
    expect(component.usuario.imagemURL).toBe('nova.png');
    expect(component.imagemURL).toBe(environment.apiURL + 'resources/Images/nova.png');
  });
});
