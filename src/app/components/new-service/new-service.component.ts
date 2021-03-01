import { Component, OnInit, Inject, PLATFORM_ID, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-service',
  templateUrl: './new-service.component.html',
  styleUrls: ['./new-service.component.scss']
})
export class NewServiceComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() account: UserAccount;

  public browser: boolean;
  private userProfile: CoachProfile;

  public newServiceForm: FormGroup;
  public focus: boolean;
  public focus1: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public headlineMinLength = 10;
  public headlineMaxLength = 120;
  public headlineActualLength = 0;

  public errorMessages = {
    type: {
      required: `Please select a service type.`
    },
    sessionDuration: {
      required: `Please enter a duration in minutes.`
    },
    headline: {
      minlength: `Your headline should be at least ${this.headlineMinLength} characters.`,
      maxlength: `Your headline should be at less than ${this.headlineMaxLength} characters.`
    }
  };

  public saving: boolean;
  public saveAttempt: boolean;

  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildServiceForm();
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.userId && !this.userProfile) {
        this.loadUserProfile(); // background load the user profile so we can save user data into new service object
      }
    }
  }

  buildServiceForm() {
    this.newServiceForm = this.formBuilder.group({
      type: ['individual', [Validators.required]], // when adding group coaching, set null here
      sessionDuration: [null, [Validators.required]],
      headline: ['', [Validators.required, Validators.minLength(this.headlineMinLength), Validators.maxLength(this.headlineMaxLength)]]
    });
  }

  get serviceF(): any {
    return this.newServiceForm.controls;
  }

  loadUserProfile() {
    // By now the user should have a public profile.
    // Service creation should not be allowed until they do.
    this.subscriptions.add(
      this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          // console.log('Fetched profile:', profile);
        }
      })
    );
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onHeadlineInput(ev: any) {
    this.headlineActualLength = (ev.target.value as string).length;
  }

  async onSubmit() {
    this.saveAttempt = true;
    this.saving = true;

    // Safety checks
    if (this.newServiceForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all fields to continue.');
      this.saving = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing UID. Please contact support.');
      this.saving = false;
      return;
    }
    if (!this.account) {
      this.alertService.alert('warning-message', 'Oops', 'Missing account data. Please contact support.');
      this.saving = false;
      return;
    }
    if (!this.userProfile || !this.userProfile.firstName || !this.userProfile.lastName || !this.userProfile.photo) {
      this.alertService.alert('warning-message', 'Oops', 'Missing public profile data. Please try again or contact support.');
      this.saving = false;
      return;
    }

    // Prepare the new service object
    const serviceId = Math.random().toString(36).substr(2, 9); // generate semi-random id
    const newService = {
      serviceId,
      sellerUid: this.userId,
      stripeId: this.account.stripeUid ? this.account.stripeUid : null,
      type: this.serviceF.type.value,
      sessionDuration: this.serviceF.sessionDuration.value,
      headline: this.serviceF.headline.value,
      coachName: `${this.userProfile.firstName} ${this.userProfile.lastName}`,
      coachPhoto: this.userProfile.photo
    } as CoachingService;

    // Save the new service to the db
    await this.dataService.savePrivateService(this.userId, newService);

    this.saving = false;
    this.saveAttempt = false;

    // Navigate to continue
    this.router.navigate(['/my-services', serviceId, 'content'], { queryParams: { targetUser: this.userId }});
  }

  cancel() {
    this.router.navigate(['/coach-products-services']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
