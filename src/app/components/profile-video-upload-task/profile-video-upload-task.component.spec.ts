import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileVideoUploadTaskComponent } from './profile-video-upload-task.component';

describe('ProfileVideoUploadTaskComponent', () => {
  let component: ProfileVideoUploadTaskComponent;
  let fixture: ComponentFixture<ProfileVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
