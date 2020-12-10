import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPromoVideoUploadTaskComponent } from './program-promo-video-upload-task.component';

describe('ProgramPromoVideoUploadTaskComponent', () => {
  let component: ProgramPromoVideoUploadTaskComponent;
  let fixture: ComponentFixture<ProgramPromoVideoUploadTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPromoVideoUploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPromoVideoUploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
