import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachMiniProfileComponent } from './coach-mini-profile.component';

describe('CoachMiniProfileComponent', () => {
  let component: CoachMiniProfileComponent;
  let fixture: ComponentFixture<CoachMiniProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachMiniProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachMiniProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
