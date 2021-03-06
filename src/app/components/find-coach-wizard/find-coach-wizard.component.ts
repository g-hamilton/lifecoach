import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

/*
  This component is designed to be a re-usable modal.
  The modal contains a form wizard that guides the user through a flow.
*/

@Component({
  selector: 'app-find-coach-wizard',
  templateUrl: './find-coach-wizard.component.html',
  styleUrls: ['./find-coach-wizard.component.scss']
})
export class FindCoachWizardComponent implements OnInit {

  // modal config - pass any data in through the modalOptions
  public message: string; // any message to display on the UI?

  // component
  private userId: string;
  public userType: string;
  public wizardForm: FormGroup;
  public saving = false;
  public rfocusTouched = false;
  public rfocusTouched1 = false;
  public rfocusTouched2 = false;
  public rfocusTouched3 = false;
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  public errorMessages = {
    firstName: {
      required: 'Please enter your first name'
    },
    lastName: {
      required: 'Please enter your first name'
    },
    email: {
      required: 'Please enter your email address',
      pattern: `Please enter a valid email address`
    },
    password: {
      required: 'Please create a password',
      minlength: `Passwords must be at least 6 characters`
    }
  };

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.buildWizardForm();
  }

  buildWizardForm() {
    this.wizardForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    );
  }

  get wizardF(): any {
    return this.wizardForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  login() {
    //
  }

  onSubmit() {
    //
  }

}
