import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NovaPartidaComponent } from './nova-partida-component';

describe('NovaPartidaComponent', () => {
  let component: NovaPartidaComponent;
  let fixture: ComponentFixture<NovaPartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaPartidaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaPartidaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
