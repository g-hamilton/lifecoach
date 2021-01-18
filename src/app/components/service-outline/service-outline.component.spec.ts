import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOutlineComponent } from './service-outline.component';

describe('ServiceOutlineComponent', () => {
  let component: ServiceOutlineComponent;
  let fixture: ComponentFixture<ServiceOutlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceOutlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceOutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
