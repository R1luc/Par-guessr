import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLocaisListaComponent } from './admin-locais-lista-component';

describe('AdminLocaisListaComponent', () => {
  let component: AdminLocaisListaComponent;
  let fixture: ComponentFixture<AdminLocaisListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLocaisListaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLocaisListaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
