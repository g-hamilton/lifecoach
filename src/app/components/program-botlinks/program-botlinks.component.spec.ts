import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramBotlinksComponent } from './program-botlinks.component';

describe('ProgramBotlinksComponent', () => {
  let component: ProgramBotlinksComponent;
  let fixture: ComponentFixture<ProgramBotlinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramBotlinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramBotlinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
