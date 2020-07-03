import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePromoVideoUploaderComponent } from './course-promo-video-uploader.component';

describe('CoursePromoVideoUploaderComponent', () => {
  let component: CoursePromoVideoUploaderComponent;
  let fixture: ComponentFixture<CoursePromoVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursePromoVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursePromoVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
