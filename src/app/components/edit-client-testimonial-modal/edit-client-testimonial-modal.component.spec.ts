import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClientTestimonialModalComponent } from './edit-client-testimonial-modal.component';

describe('EditClientTestimonialModalComponent', () => {
  let component: EditClientTestimonialModalComponent;
  let fixture: ComponentFixture<EditClientTestimonialModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditClientTestimonialModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClientTestimonialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
