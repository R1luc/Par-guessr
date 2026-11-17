import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaPalpiteComponent } from './mapa-palpite-component';

describe('MapaPalpiteComponent', () => {
  let component: MapaPalpiteComponent;
  let fixture: ComponentFixture<MapaPalpiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaPalpiteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaPalpiteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
