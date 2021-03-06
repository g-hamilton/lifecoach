import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  public errorMessages = {
    //
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
        formArray: this.formBuilder.array([
          // Group 0
          this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(1)]],
            lastName: ['', [Validators.required, Validators.minLength(1)]],
            email: [
              '',
              [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
            ]
          }),
        ])
      }
    );
  }

  get wizardF(): any {
    return this.wizardForm.controls;
  }

  get formArray() {
    return this.wizardForm.controls.formArray as FormArray;
  }

  get group0() {
    return ((this.wizardForm.controls.formArray as FormArray).controls[0] as FormGroup).controls;
  }

  onNextClick() {
    this.saveAttempt = true;
  }

  onStepChange(event: any) {
    // console.log('STEP CHANGED!', event);
    setTimeout(() => {
      this.saveAttempt = false;
    }, 10);
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
