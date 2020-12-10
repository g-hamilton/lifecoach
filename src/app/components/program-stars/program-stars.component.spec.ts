import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramStarsComponent } from './program-stars.component';

describe('ProgramStarsComponent', () => {
  let component: ProgramStarsComponent;
  let fixture: ComponentFixture<ProgramStarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramStarsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramStarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
