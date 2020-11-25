import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservedSessionsComponent } from './reserved-sessions.component';

describe('ReservedSessionsComponent', () => {
  let component: ReservedSessionsComponent;
  let fixture: ComponentFixture<ReservedSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservedSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservedSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
