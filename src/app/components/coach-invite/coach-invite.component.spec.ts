import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachInviteComponent } from './coach-invite.component';

describe('CoachInviteComponent', () => {
  let component: CoachInviteComponent;
  let fixture: ComponentFixture<CoachInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachInviteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
