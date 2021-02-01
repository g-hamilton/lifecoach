import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AlertService } from '../../services/alert.service';

import { UserAccount } from '../../interfaces/user.account.interface';

/*
  This component is designed to be a re-usable modal.
  Allows users to log in from multiple places in the app's UI
*/

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // modal config - pass any data in through the modalOptions
  public configData: any; // not using

  // component
  public loginForm: FormGroup;
  public login = false;
  public focusTouched = false;
  public focusTouched1 = false;

  public objKeys = Object.keys;

  public errorMessages = {
    email: {
      required: 'Please enter your login email',
      email: `Please enter a valid email address`
    },
    password: {
      required: 'Please enter your password',
      minlength: `Passwords are at least 6 characters`
    }
  };

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private analyticsService: AnalyticsService,
    private alertService: AlertService
    ) {}

  ngOnInit() {
    // Build the login form
    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }
    );
    console.log(this.errorMessages.password.minlength);
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
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
        this.bsModalRef.hide();
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
          this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
        } else {
          // Fall back for unknown / no error code
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please try again or contact hello@lifecoach.io for assistance.');
        }
      }
    } else {
      this.alertService.alert('warning-message', 'Almost Done!', 'Please complete all required fields.');
    }
  }
}
