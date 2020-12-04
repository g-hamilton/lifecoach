import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramCoachComponent } from './program-coach.component';

describe('ProgramCoachComponent', () => {
  let component: ProgramCoachComponent;
  let fixture: ComponentFixture<ProgramCoachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramCoachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
