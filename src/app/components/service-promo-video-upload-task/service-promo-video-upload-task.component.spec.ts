import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePromoVideoUploadTaskComponent } from './service-promo-video-upload-task.component';

describe('ServicePromoVideoUploadTaskComponent', () => {
  let component: ServicePromoVideoUploadTaskComponent;
  let fixture: ComponentFixture<ServicePromoVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicePromoVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePromoVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
