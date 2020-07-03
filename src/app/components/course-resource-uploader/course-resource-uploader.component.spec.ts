import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseResourceUploaderComponent } from './course-resource-uploader.component';

describe('CourseResourceUploaderComponent', () => {
  let component: CourseResourceUploaderComponent;
  let fixture: ComponentFixture<CourseResourceUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseResourceUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseResourceUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
