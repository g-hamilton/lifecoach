import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseQaSearchFiltersComponent } from './course-qa-search-filters.component';

describe('CourseQaSearchFiltersComponent', () => {
  let component: CourseQaSearchFiltersComponent;
  let fixture: ComponentFixture<CourseQaSearchFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseQaSearchFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseQaSearchFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
