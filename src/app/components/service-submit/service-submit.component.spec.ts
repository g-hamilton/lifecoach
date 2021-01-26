import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSubmitComponent } from './service-submit.component';

describe('ServiceSubmitComponent', () => {
  let component: ServiceSubmitComponent;
  let fixture: ComponentFixture<ServiceSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
