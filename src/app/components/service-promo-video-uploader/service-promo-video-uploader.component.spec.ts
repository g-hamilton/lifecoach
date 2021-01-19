import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePromoVideoUploaderComponent } from './service-promo-video-uploader.component';

describe('ServicePromoVideoUploaderComponent', () => {
  let component: ServicePromoVideoUploaderComponent;
  let fixture: ComponentFixture<ServicePromoVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicePromoVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePromoVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
