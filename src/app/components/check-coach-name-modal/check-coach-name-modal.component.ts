import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FindCoachWizardComponent } from '../find-coach-wizard/find-coach-wizard.component';

/*
  This component is designed to be a re-usable modal.
  Checks if the user wants to find a coach by name.
  If yes, we can search, if not, we can launch the find a coach flow.
*/

@Component({
  selector: 'app-check-coach-name-modal',
  templateUrl: './check-coach-name-modal.component.html',
  styleUrls: ['./check-coach-name-modal.component.scss']
})
export class CheckCoachNameModalComponent implements OnInit {

  // modal config - pass any data in through the modalOptions
  public message: string; // any message to display on the UI?

  // component
  private userId: string;
  public userType: string;
  public checkForm: FormGroup;
  public focusTouched: boolean;
  public saving = false;
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  public errorMessages = {
    coachName: {
      required: 'Please enter a coach name'
    },
  };

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
    this.buildCheckForm();
  }

  buildCheckForm() {
    this.checkForm = this.formBuilder.group({
      coachName: [null, [Validators.required]]
    });
  }

  get checkF(): any {
    return this.checkForm.controls;
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
    if (this.checkForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', `Please complete all required fields to proceed.`);
      return;
    }

    this.saving = true;

    // if the user has input search data, run the search...
    const coachName = this.checkF.coachName.value;

    this.bsModalRef.hide(); // hide the current modal
    this.saving = false;

    // redirect to search page with param...
    this.router.navigate(['/coaches'], { queryParams: { q: coachName} });
    this.saveAttempt = false;
  }

  onGetStarted() {
    // if the user has not given data, pop get started modal wizard

    this.bsModalRef.hide(); // hide the current modal

    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      class: 'modal-lg', // let's make this a large one!
      initialState: {
        message: `Let's do this!`
      } as any
    };
    this.bsModalRef = this.modalService.show(FindCoachWizardComponent, config);
  }

}
