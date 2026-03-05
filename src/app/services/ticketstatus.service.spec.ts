import { TestBed } from '@angular/core/testing';

import { TicketStatusService } from './ticketstatus.service';

describe('TicketstatusService', () => {
  let service: TicketStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
