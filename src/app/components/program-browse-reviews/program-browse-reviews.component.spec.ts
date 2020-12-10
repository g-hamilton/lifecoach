import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramBrowseReviewsComponent } from './program-browse-reviews.component';

describe('ProgramBrowseReviewsComponent', () => {
  let component: ProgramBrowseReviewsComponent;
  let fixture: ComponentFixture<ProgramBrowseReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramBrowseReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramBrowseReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
