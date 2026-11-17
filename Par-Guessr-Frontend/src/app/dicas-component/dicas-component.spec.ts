import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicasComponent } from './dicas-component';

describe('DicasComponent', () => {
  let component: DicasComponent;
  let fixture: ComponentFixture<DicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DicasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
