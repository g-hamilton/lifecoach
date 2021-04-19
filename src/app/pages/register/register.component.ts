import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { AnalyticsService } from '../../services/analytics.service';

import { UserAccount } from '../../interfaces/user.account.interface';
import { Subscription } from 'rxjs';
import { User } from 'firebase';

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {

  private user: User;
  public registerForm: FormGroup;
  public register: boolean;
  public registerAttempt: boolean;
  public focusTouched: boolean;
  public focusTouched1: boolean;
  public coachPlan: string;

  public objKeys = Object.keys;

  private subscriptions: Subscription = new Subscription();

  public errorMessages = {
    firstName: {
      required: 'Please enter your first name'
    },
    lastName: {
      required: 'Please enter your last name'
    },
    accountType: {
      required: 'Please confirm your account type'
    }
  };

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    // console.log(this.registerF, 'register', this.registerF.accountType.value);
    this.titleService.setTitle('Complete Your Sign Up');
    this.metaTagService.updateTag({name: 'description', content: 'Complete your sign up with Lifecoach, the premier online coaching & personal transformation platform.'});

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('register-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }

    // If coming here post sign up, we should now have a Firebase auth user object, so try to get it...
    this.getAuthUser();

    // Build the register form
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        accountType: [null, [Validators.required]],
        plan: [null] // optional. if joining as a coach, we will try to save the selected plan here
      }
    );

    // Check localStorage for account type
    const accountType = localStorage.getItem('lifecoachAccountType');
    if (accountType) {
      this.registerForm.patchValue({ accountType });
    }
  }

  getAuthUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(async user => { // subscribe to the user
          if (user) {
            console.log('Auth user:', user);
            this.user = user;
          }
        })
    );
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('register-page');
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  async onRegister() {

    this.registerAttempt = true;

    // Check form validity
    if (this.registerForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
      return;
    }

    // Check we have a uid
    if (!this.user.uid) {
      this.alertService.alert('warning-message', 'Oops', `Something went wrong. Please use the 'Report an Issue' button below to get support.`);
      return;
    }

    this.register = true;

    const plan = localStorage.getItem('lifecoachBillingPlan') as any;

    // Create new account object
    const newUserAccount: UserAccount = {
      uid: this.user.uid,
      accountEmail: this.user.email,
      accountType: this.registerF.accountType.value,
      firstName: this.registerF.firstName.value,
      lastName: this.registerF.lastName.value,
      plan: plan ? plan : null
    };

    // console.log(newUserAccount);

    const name = this.registerF.firstName.value;

    const res = await this.authService.createDbUser(newUserAccount) as any;

    if (res.error) { // error
      this.alertService.alert('warning-message', 'Oops!', `${res.error}. Please contact support.`);
      return;
    }

    // success
    this.analyticsService.registeredUser(newUserAccount, 'passwordless');
    await this.alertService.alert('success-message', 'Success!', `Your account is ready ${name}. Let's visit your Lifecoach dashboard...`);
    this.router.navigate(['/dashboard']);
    this.registerAttempt = false;
  }

}
