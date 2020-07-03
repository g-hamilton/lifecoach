import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachContactComponent } from './coach-contact.component';

describe('CoachContactComponent', () => {
  let component: CoachContactComponent;
  let fixture: ComponentFixture<CoachContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
