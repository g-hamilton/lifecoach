import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseResourceUploadTaskComponent } from './course-resource-upload-task.component';

describe('CourseResourceUploadTaskComponent', () => {
  let component: CourseResourceUploadTaskComponent;
  let fixture: ComponentFixture<CourseResourceUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseResourceUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseResourceUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
