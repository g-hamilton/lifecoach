import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnLecturesNavigatorComponent } from './learn-lectures-navigator.component';

describe('LearnLecturesNavigatorComponent', () => {
  let component: LearnLecturesNavigatorComponent;
  let fixture: ComponentFixture<LearnLecturesNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnLecturesNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnLecturesNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
