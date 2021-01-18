import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePromoteComponent } from './service-promote.component';

describe('ServicePromoteComponent', () => {
  let component: ServicePromoteComponent;
  let fixture: ComponentFixture<ServicePromoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicePromoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePromoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
