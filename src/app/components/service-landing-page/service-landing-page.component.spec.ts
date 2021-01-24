import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceLandingPageComponent } from './service-landing-page.component';

describe('ServiceLandingPageComponent', () => {
  let component: ServiceLandingPageComponent;
  let fixture: ComponentFixture<ServiceLandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceLandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
