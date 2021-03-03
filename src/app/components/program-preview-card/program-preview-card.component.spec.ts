import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPreviewCardComponent } from './program-preview-card.component';

describe('ProgramPreviewCardComponent', () => {
  let component: ProgramPreviewCardComponent;
  let fixture: ComponentFixture<ProgramPreviewCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPreviewCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPreviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
