import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseBrowseReviewsComponent } from './course-browse-reviews.component';

describe('CourseBrowseReviewsComponent', () => {
  let component: CourseBrowseReviewsComponent;
  let fixture: ComponentFixture<CourseBrowseReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseBrowseReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseBrowseReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
