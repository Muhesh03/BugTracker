import { TestBed } from '@angular/core/testing';

import { LiveticketNotesService } from './liveticket-notes.service';

describe('LiveticketNotesService', () => {
  let service: LiveticketNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveticketNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
