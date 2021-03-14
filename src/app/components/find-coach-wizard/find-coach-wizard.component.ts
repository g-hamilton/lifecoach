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
  public isCertificationsCollapsed = true;

  public objKeys = Object.keys;

  public errorMessages = {
    showCertified: {
      required: `Please select an option`
    }
  };

  public goals = ['Becoming a Better Leader', 'Growing Your Influence', 'Building Confidence', 'Developing Self-Awareness',
  'Recovering from Injury', 'Creating Better Habits', 'Better Time-Management', 'Finding Your Purpose', 'Increasing Your Energy',
  'Teamwork', 'Determination', 'Managing Finances', 'Deeper Sleep', 'Forgiveness',
  'Healing From Trauma', 'Long-Term Planning', 'Overcoming Fear & Anxiety', 'Finding Clarity', 'Defining Your Vision',
  'Moving Past Pain', 'Finding Focus', 'Building Resilience to Stress', 'Authenticity', 'Improved Flexibility', 'Self-Acceptance', 'Love',
  'Stronger Relationships', 'Renewing Your Passion', 'Inspiring Others', 'Emotional Intelligence', 'Positive Thinking',
  'Better Ageing', 'Deeper Meditation', 'Athletic Performance', 'Healthier Immune System', 'Achieving More',
  'Emotional Balance', 'Getting Fit', 'Improving Your Posture', 'Resistance to Overwhelm', 'Finding Inner Peace'];

  public challenges = ['financial crisis', 'health crisis', 'difficult relationship', 'personal conflict', 'career pressure',
  'unfair treatment', 'emptiness', 'boredom', 'confusion', 'friendship struggles', 'jealousy', 'physical pain', 'emotional pain',
  'stress', 'anxiety', 'haunting past', 'failure', 'insecurity', 'feeling unsafe', 'forgiveness', 'lack of knowledge',
  'understanding', 'loss', 'grief', 'complexity', 'citicism', 'redundancy', 'bankruptcy', 'making mistakes', 'breakup',
  'low confidence', 'embarassment', 'low self-esteem', 'dark thoughts', 'fear', 'staying on track', 'too many options',
  'finding the time', 'not sure how to plan', 'giving up', 'poor self-awareness'];

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
            showCertified: [null, [Validators.required]],
            anyCert: [null],
            icf: [null],
            emcc: [null],
            ac: [null],
            anyExp: [null],
            foundation: [null],
            experienced: [null],
            master: [null],
            gender: ['any']
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

  onShowCertifiedChange(ev: any) {
    console.log(ev.target.value);
  }

  onSubmit() {
    // console.log('formData', this.wizardForm.value);

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

    // cleanup!
    const newParams = {};
    Object.keys(merged).forEach(key => {
      if (key) {
        if (!merged[key]) { // remove any null or undefined data
          return;
        }
        if (merged[key] === 'false') { // remove any string false
          return;
        }
        if (Array.isArray(merged[key]) && !merged[key].length) { // remove any empty arrays
          return;
        }
        if (key === 'anyExp') { // remove the anyExp key
          return;
        }
        if (key === 'gender' && merged[key] === 'any') { // remove any gender
          return;
        }
        newParams[key] = merged[key];
      }
    });

    console.log('newParams', newParams);

    this.bsModalRef.hide(); // hide the current modal
    this.saveAttempt = false;
    this.saving = false;

    // shall we save to localstorage as a backup?

    // redirect to search/browse coaches page with params
    this.router.navigate(['/coaches'], { queryParams: newParams });
  }

}
