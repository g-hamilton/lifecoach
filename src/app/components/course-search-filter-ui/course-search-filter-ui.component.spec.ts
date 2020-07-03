import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSearchFilterUiComponent } from './course-search-filter-ui.component';

describe('CourseSearchFilterUiComponent', () => {
  let component: CourseSearchFilterUiComponent;
  let fixture: ComponentFixture<CourseSearchFilterUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseSearchFilterUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseSearchFilterUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
