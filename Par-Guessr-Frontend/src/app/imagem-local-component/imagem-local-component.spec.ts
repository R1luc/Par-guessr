import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagemLocalComponent } from './imagem-local-component';

describe('ImagemLocalComponent', () => {
  let component: ImagemLocalComponent;
  let fixture: ComponentFixture<ImagemLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagemLocalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagemLocalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
