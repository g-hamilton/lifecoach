import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramMoreComponent } from './program-more.component';

describe('ProgramMoreComponent', () => {
  let component: ProgramMoreComponent;
  let fixture: ComponentFixture<ProgramMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
