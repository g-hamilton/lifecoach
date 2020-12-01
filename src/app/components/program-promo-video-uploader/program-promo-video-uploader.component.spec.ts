import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramPromoVideoUploaderComponent } from './program-promo-video-uploader.component';

describe('ProgramPromoVideoUploaderComponent', () => {
  let component: ProgramPromoVideoUploaderComponent;
  let fixture: ComponentFixture<ProgramPromoVideoUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramPromoVideoUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramPromoVideoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
