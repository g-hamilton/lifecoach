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
  public message: string; // any message to display on the UI?
  private successMessage: string; // any message to display after successful register?
  private redirectUrl: any[]; // if we need to redirect the user, pass nav commands

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
}
