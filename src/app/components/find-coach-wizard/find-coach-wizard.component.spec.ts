import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindCoachWizardComponent } from './find-coach-wizard.component';

describe('FindCoachWizardComponent', () => {
  let component: FindCoachWizardComponent;
  let fixture: ComponentFixture<FindCoachWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindCoachWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindCoachWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
