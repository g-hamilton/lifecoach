import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCourseNavbarComponent } from './auth-course-navbar.component';

describe('AuthCourseNavbarComponent', () => {
  let component: AuthCourseNavbarComponent;
  let fixture: ComponentFixture<AuthCourseNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCourseNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCourseNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
