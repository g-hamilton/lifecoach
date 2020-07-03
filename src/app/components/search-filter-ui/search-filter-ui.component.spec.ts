import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterUiComponent } from './search-filter-ui.component';

describe('SearchFilterUiComponent', () => {
  let component: SearchFilterUiComponent;
  let fixture: ComponentFixture<SearchFilterUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFilterUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
