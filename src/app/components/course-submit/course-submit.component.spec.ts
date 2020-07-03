import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSubmitComponent } from './course-submit.component';

describe('CourseSubmitComponent', () => {
  let component: CourseSubmitComponent;
  let fixture: ComponentFixture<CourseSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
