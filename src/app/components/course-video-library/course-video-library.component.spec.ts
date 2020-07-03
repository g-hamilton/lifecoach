import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseVideoLibraryComponent } from './course-video-library.component';

describe('CourseVideoLibraryComponent', () => {
  let component: CourseVideoLibraryComponent;
  let fixture: ComponentFixture<CourseVideoLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseVideoLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseVideoLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
