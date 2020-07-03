import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseQaComponent } from './course-qa.component';

describe('CourseQaComponent', () => {
  let component: CourseQaComponent;
  let fixture: ComponentFixture<CourseQaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseQaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseQaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
