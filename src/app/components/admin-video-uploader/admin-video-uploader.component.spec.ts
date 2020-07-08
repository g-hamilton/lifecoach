import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVideoUploaderComponent } from './admin-video-uploader.component';

describe('AdminVideoUploaderComponent', () => {
  let component: AdminVideoUploaderComponent;
  let fixture: ComponentFixture<AdminVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
