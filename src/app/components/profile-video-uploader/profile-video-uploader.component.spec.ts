import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileVideoUploaderComponent } from './profile-video-uploader.component';

describe('ProfileVideoUploaderComponent', () => {
  let component: ProfileVideoUploaderComponent;
  let fixture: ComponentFixture<ProfileVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
