import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonScheduleACallComponent } from './button-schedule-a-call.component';

describe('ButtonScheduleACallComponent', () => {
  let component: ButtonScheduleACallComponent;
  let fixture: ComponentFixture<ButtonScheduleACallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonScheduleACallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonScheduleACallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
