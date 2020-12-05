import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramFeedbackComponent } from './program-feedback.component';

describe('ProgramFeedbackComponent', () => {
  let component: ProgramFeedbackComponent;
  let fixture: ComponentFixture<ProgramFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
