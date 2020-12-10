import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPromoteComponent } from './program-promote.component';

describe('ProgramPromoteComponent', () => {
  let component: ProgramPromoteComponent;
  let fixture: ComponentFixture<ProgramPromoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPromoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPromoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
