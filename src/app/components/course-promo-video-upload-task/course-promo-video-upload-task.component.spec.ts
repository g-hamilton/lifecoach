import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePromoVideoUploadTaskComponent } from './course-promo-video-upload-task.component';

describe('CoursePromoVideoUploadTaskComponent', () => {
  let component: CoursePromoVideoUploadTaskComponent;
  let fixture: ComponentFixture<CoursePromoVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursePromoVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursePromoVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
