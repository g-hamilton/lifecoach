import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramSearchFilterUiComponent } from './program-search-filter-ui.component';

describe('ProgramSearchFilterUiComponent', () => {
  let component: ProgramSearchFilterUiComponent;
  let fixture: ComponentFixture<ProgramSearchFilterUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramSearchFilterUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramSearchFilterUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
