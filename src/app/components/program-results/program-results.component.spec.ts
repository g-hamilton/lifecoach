import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramResultsComponent } from './program-results.component';

describe('ProgramResultsComponent', () => {
  let component: ProgramResultsComponent;
  let fixture: ComponentFixture<ProgramResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
