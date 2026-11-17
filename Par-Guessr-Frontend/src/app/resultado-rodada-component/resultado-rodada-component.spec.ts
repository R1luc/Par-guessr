import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoRodadaComponent } from './resultado-rodada-component';

describe('ResultadoRodadaComponent', () => {
  let component: ResultadoRodadaComponent;
  let fixture: ComponentFixture<ResultadoRodadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoRodadaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadoRodadaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
