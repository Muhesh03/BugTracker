import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTypeComponent } from './tickettype.component';

describe('TickettypeComponent', () => {
  let component: TicketTypeComponent;
  let fixture: ComponentFixture<TicketTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
