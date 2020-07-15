import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVideoUploadTaskComponent } from './admin-video-upload-task.component';

describe('AdminVideoUploadTaskComponent', () => {
  let component: AdminVideoUploadTaskComponent;
  let fixture: ComponentFixture<AdminVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
