import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePromoteComponent } from './course-promote.component';

describe('CoursePromoteComponent', () => {
  let component: CoursePromoteComponent;
  let fixture: ComponentFixture<CoursePromoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursePromoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursePromoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
