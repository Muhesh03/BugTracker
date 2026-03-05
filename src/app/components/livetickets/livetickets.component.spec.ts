import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveTicketsComponent } from './livetickets.component';

describe('LiveticketsComponent', () => {
  let component: LiveTicketsComponent;
  let fixture: ComponentFixture<LiveTicketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveTicketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
