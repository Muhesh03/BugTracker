import { TestBed } from '@angular/core/testing';

import { TicketTypeService } from './tickettype.service';

describe('TickettypeService', () => {
  let service: TicketTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
