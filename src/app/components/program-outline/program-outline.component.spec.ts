import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramOutlineComponent } from './program-outline.component';

describe('ProgramOutlineComponent', () => {
  let component: ProgramOutlineComponent;
  let fixture: ComponentFixture<ProgramOutlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramOutlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramOutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
