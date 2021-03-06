import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachHistoryTimelineComponent } from './coach-history-timeline.component';

describe('CoachHistoryTimelineComponent', () => {
  let component: CoachHistoryTimelineComponent;
  let fixture: ComponentFixture<CoachHistoryTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachHistoryTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachHistoryTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
