import { TestBed } from '@angular/core/testing';

import { AldeasService } from './aldeas.service';

describe('AldeasService', () => {
  let service: AldeasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AldeasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
