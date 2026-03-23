import { TestBed } from '@angular/core/testing';

import { LiveticketService } from './liveticket.service';

describe('LiveticketService', () => {
  let service: LiveticketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveticketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
