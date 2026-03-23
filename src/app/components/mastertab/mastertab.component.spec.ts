import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MastertabComponent } from './mastertab.component';

describe('MastertabComponent', () => {
  let component: MastertabComponent;
  let fixture: ComponentFixture<MastertabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MastertabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MastertabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
