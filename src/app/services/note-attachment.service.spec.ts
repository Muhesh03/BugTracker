import { TestBed } from '@angular/core/testing';

import { NoteAttachmentService } from './note-attachment.service';

describe('NoteAttachmentService', () => {
  let service: NoteAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
