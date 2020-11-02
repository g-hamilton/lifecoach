import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from '../../services/alert.service';
import { AnalyticsService } from '../../services/analytics.service';

import { UserAccount } from '../../interfaces/user.account.interface';

@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {

  public registerForm: FormGroup;
  public register = false;
  public focusTouched = false;
  public focusTouched1 = false;
  public focusTouched2 = false;
  public focusTouched3 = false;
  public coachPlans = [
    {id: '001', itemName: 'Free', price: 0},
    {id: '002', itemName: 'Spark', price: 9},
    {id: '003', itemName: 'Flame', price: 29},
    {id: '004', itemName: 'Blaze', price: 49}
  ]; // Not using these yet but if a selector is needed they're ready!

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    // console.log(this.registerF, 'register', this.registerF.accountType.value);
    this.titleService.setTitle('Signup to Lifecoach');
    this.metaTagService.updateTag({name: 'description', content: 'Join the fastest growing life coaching community'});

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('register-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }

    // Build the register form
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        accountType: [null, [Validators.required]],
        termsAccepted: [false, Validators.pattern('true')]
      }
    );

    // Check activated route params for user type to register
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      this.registerForm.patchValue({
        accountType: params.type // update the form with account type
      });
    });
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('register-page');
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  async onRegister() {

    // Check form validity
    if (this.registerForm.valid) {
      this.register = true;
      // Create new account object
      const newUserAccount: UserAccount = {
        accountEmail: this.registerF.email.value,
        password: this.registerF.password.value,
        // accountType: 'admin', // Uncomment and comment next-line to create admin acc
        accountType: this.registerF.accountType.value,
        firstName: this.registerF.firstName.value,
        lastName: this.registerF.lastName.value
      };
      const firstName = this.registerF.firstName.value;
      // Check account type & attempt registration
      const response = await this.authService.createUserWithEmailAndPassword(newUserAccount);
      if (!response.error) {
        // Success
        this.register = false;
        console.log('Registration successful:', response.result.user);
        this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
        await this.alertService.alert('success-message', 'Success!', `
        Welcome to Lifecoach ${firstName}! Let's visit your new dashboard...`);
        this.router.navigate(['/dashboard'], {state: {uid: response.result.user.uid}});
      } else {
        // Error
        this.register = false;
        if (response.error.code === 'auth/email-already-in-use') {
          this.alertService.alert('warning-message', 'Oops', 'That email is already registered. Please log in.');
        } else if (response.error.code === 'auth/invalid-email') {
          this.alertService.alert('warning-message', 'Oops', 'Invalid email address. Please try a different email.');
        } else if (response.error.code === 'auth/weak-password') {
          this.alertService.alert('warning-message', 'Oops', 'Password is too weak. Please use a stronger password.');
        } else {
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please contact hello@lifecoach.io for help');
        }
      }
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
    }
  }
}
