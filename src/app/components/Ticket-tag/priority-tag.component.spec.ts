import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityTagComponent } from './priority-tag.component';

describe('PriorityTagComponent', () => {
  let component: PriorityTagComponent;
  let fixture: ComponentFixture<PriorityTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorityTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
