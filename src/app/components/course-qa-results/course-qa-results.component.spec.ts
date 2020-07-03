import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseQaResultsComponent } from './course-qa-results.component';

describe('CourseQaResultsComponent', () => {
  let component: CourseQaResultsComponent;
  let fixture: ComponentFixture<CourseQaResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseQaResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseQaResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
