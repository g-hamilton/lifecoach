import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionFeedComponent } from './discussion-feed.component';

describe('DiscussionFeedComponent', () => {
  let component: DiscussionFeedComponent;
  let fixture: ComponentFixture<DiscussionFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
