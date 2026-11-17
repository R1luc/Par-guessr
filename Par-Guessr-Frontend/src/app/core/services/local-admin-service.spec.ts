import { TestBed } from '@angular/core/testing';

import { LocalAdminService } from './local-admin-service';

describe('LocalAdminService', () => {
  let service: LocalAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
