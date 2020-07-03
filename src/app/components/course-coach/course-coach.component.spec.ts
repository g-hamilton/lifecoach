import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCoachComponent } from './course-coach.component';

describe('CourseCoachComponent', () => {
  let component: CourseCoachComponent;
  let fixture: ComponentFixture<CourseCoachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseCoachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
