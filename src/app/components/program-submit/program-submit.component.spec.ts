import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramSubmitComponent } from './program-submit.component';

describe('ProgramSubmitComponent', () => {
  let component: ProgramSubmitComponent;
  let fixture: ComponentFixture<ProgramSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
