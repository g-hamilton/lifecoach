import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionReplyFormComponent } from './discussion-reply-form.component';

describe('DiscussionReplyFormComponent', () => {
  let component: DiscussionReplyFormComponent;
  let fixture: ComponentFixture<DiscussionReplyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionReplyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionReplyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
