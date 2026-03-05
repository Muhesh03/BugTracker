import { TestBed } from '@angular/core/testing';

import { TicketpriorityService } from './ticketpriority.service';

describe('TicketpriorityService', () => {
  let service: TicketpriorityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketpriorityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
