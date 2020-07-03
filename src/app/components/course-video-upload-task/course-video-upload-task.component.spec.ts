import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseVideoUploadTaskComponent } from './course-video-upload-task.component';

describe('CourseVideoUploadTaskComponent', () => {
  let component: CourseVideoUploadTaskComponent;
  let fixture: ComponentFixture<CourseVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
