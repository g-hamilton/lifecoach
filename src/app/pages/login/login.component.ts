import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AlertService } from '../../services/alert.service';

import { UserAccount } from '../../interfaces/user.account.interface';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginForm: FormGroup;
  public login = false;
  public focusTouched = false;
  public focusTouched1 = false;

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private titleService: Title,
    private metaTagService: Meta
    ) {}

  ngOnInit() {
    this.titleService.setTitle('Login to Lifecoach');
    this.metaTagService.updateTag({name: 'description', content: 'Log into your Lifecoach account'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('login-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }

    // Build the login form
    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }
    );
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  async forgotPassword() {
    const res = await this.alertService.alert('input-field', 'Forgot your password?',
    'No problem! Simply request a password reset email...') as any;
    if (res.complete && res.data) {
      const email = (res.data as string).toLowerCase().trim();
      const response = await this.authService.resetPassword(email) as any;
      console.log(response);
      if (response.result !== 'error') {
        this.alertService.alert('success-message', 'Success!', `Your password reset email is on the way. Please check your inbox.`);
      } else {
        console.log(response.msg);
        if (response.msg === 'auth/user-not-found') {
          this.alertService.alert('warning-message', 'Oops!', 'That email address has not been found. Please check it and try again.');
        } else {
          this.alertService.alert('warning-message', 'Oops!', 'Something went wrong. Please contact hello@lifecoach.io for help.');
        }
      }
    }
  }

  async onLogin() {
    // Log the user in
    if (this.loginForm.valid) {
      this.login = true;
      const account: UserAccount = {
        accountEmail: this.loginF.email.value,
        password: this.loginF.password.value,
        accountType: null
      };
      const res = await this.authService.signInWithEmailAndPassword(account);
      if (!res.error) {
        // Login successful.
        this.router.navigate(['/dashboard']);
        this.alertService.alert('auto-close', 'Login Successful', 'Welcome back!');
        this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
      } else {
        // Login error.
        this.login = false;
        // Check auth provider error codes.
        if (res.error.code === 'auth/wrong-password') {
          this.alertService.alert('warning-message', 'Oops', 'Incorrect password. Please try again.');
        } else if (res.error.code === 'auth/user-not-found') {
          // tslint:disable-next-line: max-line-length
          this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
        } else {
          // Fall back for unknown / no error code
          // tslint:disable-next-line: max-line-length
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please try again or contact hello@lifecoach.io for assistance.');
        }
      }
    } else {
      this.alertService.alert('warning-message', 'Almost Done!', 'Please complete all required fields.');
    }
  }
}
