import { TestBed } from '@angular/core/testing';

import { IssueTicketService } from './issueticket.service';

describe('IssueticketService', () => {
  let service: IssueTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
