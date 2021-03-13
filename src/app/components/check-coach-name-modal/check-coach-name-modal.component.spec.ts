import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCoachNameModalComponent } from './check-coach-name-modal.component';

describe('CheckCoachNameModalComponent', () => {
  let component: CheckCoachNameModalComponent;
  let fixture: ComponentFixture<CheckCoachNameModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckCoachNameModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCoachNameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
