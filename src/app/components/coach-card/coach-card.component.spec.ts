import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCardComponent } from './coach-card.component';

describe('CoachCardComponent', () => {
  let component: CoachCardComponent;
  let fixture: ComponentFixture<CoachCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
