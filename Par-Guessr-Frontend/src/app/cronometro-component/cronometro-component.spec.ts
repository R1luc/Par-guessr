import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronometroComponent } from './cronometro-component';

describe('CronometroComponent', () => {
  let component: CronometroComponent;
  let fixture: ComponentFixture<CronometroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronometroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CronometroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
