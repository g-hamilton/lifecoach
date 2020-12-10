import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramLandingPageComponent } from './program-landing-page.component';

describe('ProgramLandingPageComponent', () => {
  let component: ProgramLandingPageComponent;
  let fixture: ComponentFixture<ProgramLandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramLandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
