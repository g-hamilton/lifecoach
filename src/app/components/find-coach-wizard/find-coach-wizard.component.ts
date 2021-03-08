import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  public goals = ['one', 'two', 'three'];
  public challenges = ['one', 'two', 'three'];

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private router: Router
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
            goals: [[]] // init with an empty array
          }),

          // Group 1
          this.formBuilder.group({
            challenges: [[]] // init with an empty array
          }),

          // Group 2
          this.formBuilder.group({
            other: [null]
          })

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

  get group1() {
    return ((this.wizardForm.controls.formArray as FormArray).controls[1] as FormGroup).controls;
  }

  get group2() {
    return ((this.wizardForm.controls.formArray as FormArray).controls[2] as FormGroup).controls;
  }

  onNextClick() {
    // this.saveAttempt = true;
  }

  onStepChange(event: any) {
    console.log('STEP CHANGED!', event);
    console.log('formData', this.wizardForm.value);
    // setTimeout(() => {
    //   this.saveAttempt = false;
    // }, 10);
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
    console.log('Submit!');
    console.log('formData', this.wizardForm.value);

    this.saveAttempt = true;

    // safety first
    if (this.wizardForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', `Please complete all required fields to proceed.`);
      return;
    }

    // form is valid...
    this.saving = true;

    // Restructure the form data as a flat object
    const a = JSON.parse(JSON.stringify(((this.wizardForm.controls.formArray as FormArray).controls[0] as FormGroup).value));
    const b = JSON.parse(JSON.stringify(((this.wizardForm.controls.formArray as FormArray).controls[1] as FormGroup).value));
    const c = JSON.parse(JSON.stringify(((this.wizardForm.controls.formArray as FormArray).controls[2] as FormGroup).value));
    const merged = {...a, ...b, ...c};

    console.log('merged form data', merged);

    this.bsModalRef.hide(); // hide the current modal
    this.saveAttempt = false;
    this.saving = false;

    // redirect to search/browse coaches page with params or localstorage saved data
    this.router.navigate(['/coaches']); // TODO: params/localStorage
  }

}
