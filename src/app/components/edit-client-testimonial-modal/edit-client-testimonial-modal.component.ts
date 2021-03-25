import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AnalyticsService } from 'app/services/analytics.service';
import { AlertService } from 'app/services/alert.service';

/*
  This component is designed to be a re-usable modal.
  Allows coach or client to create or edit a client testimonial.
*/

@Component({
  selector: 'app-edit-client-testimonial-modal',
  templateUrl: './edit-client-testimonial-modal.component.html',
  styleUrls: ['./edit-client-testimonial-modal.component.scss']
})
export class EditClientTestimonialModalComponent implements OnInit {

  // modal config - pass any data in through the modalOptions
  public title: string;

  // component
  private userId: string;
  public testimonialForm: FormGroup;
  public focusTouched: boolean;
  public saving = false;
  public saveAttempt: boolean;
  public errorMessages = {
    firstName: {
      required: 'Please enter a first name'
    },
  };

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private analyticsService: AnalyticsService,
    private modalService: BsModalService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.buildTestimonialForm();
  }

  buildTestimonialForm() {
    this.testimonialForm = this.formBuilder.group({
      firstName: [null, [Validators.required]]
    });
  }

  get tF(): any {
    return this.testimonialForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onSubmit() {
    this.saveAttempt = true;

    // safety first!
    if (this.testimonialForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', `Please complete all required fields to proceed.`);
      return;
    }

    this.saving = true;

    // do stuff

    // success
    this.bsModalRef.hide(); // hide the current modal
    this.saving = false;
    this.saveAttempt = false;
  }

}
