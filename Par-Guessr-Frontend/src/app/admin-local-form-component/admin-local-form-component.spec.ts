import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLocalFormComponent } from './admin-local-form-component';

describe('AdminLocalFormComponent', () => {
  let component: AdminLocalFormComponent;
  let fixture: ComponentFixture<AdminLocalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLocalFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLocalFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
