import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ResultadoPartidaComponent } from './resultado-partida-component';

describe('ResultadoPartidaComponent', () => {
  let component: ResultadoPartidaComponent;
  let fixture: ComponentFixture<ResultadoPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoPartidaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadoPartidaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});