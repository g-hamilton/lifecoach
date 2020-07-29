import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonHistoryTimelineComponent } from './person-history-timeline.component';

describe('PersonHistoryTimelineComponent', () => {
  let component: PersonHistoryTimelineComponent;
  let fixture: ComponentFixture<PersonHistoryTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonHistoryTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonHistoryTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
