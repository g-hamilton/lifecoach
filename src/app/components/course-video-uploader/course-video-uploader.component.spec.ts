import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseVideoUploaderComponent } from './course-video-uploader.component';

describe('CourseVideoUploaderComponent', () => {
  let component: CourseVideoUploaderComponent;
  let fixture: ComponentFixture<CourseVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
