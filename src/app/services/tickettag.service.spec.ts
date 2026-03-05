import { TestBed } from '@angular/core/testing';

import { TickettagService } from './tickettag.service';

describe('TickettagService', () => {
  let service: TickettagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TickettagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
