import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMoreComponent } from './course-more.component';

describe('CourseMoreComponent', () => {
  let component: CourseMoreComponent;
  let fixture: ComponentFixture<CourseMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
