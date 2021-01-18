import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceMoreComponent } from './service-more.component';

describe('ServiceMoreComponent', () => {
  let component: ServiceMoreComponent;
  let fixture: ComponentFixture<ServiceMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
