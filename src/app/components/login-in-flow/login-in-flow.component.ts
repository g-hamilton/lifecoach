import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from 'app/services/alert.service';

import { environment } from 'environments/environment';

import { FirebaseLoginResponse } from 'app/interfaces/firebase.login.response.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-in-flow',
  templateUrl: './login-in-flow.component.html',
  styleUrls: ['./login-in-flow.component.scss']
})
export class LoginInFlowComponent implements OnInit {

  @Input() email: string;
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() showAlert: boolean;
  @Input() alertText: string;

  @Output() loginEvent = new EventEmitter<FirebaseLoginResponse>();
  @Output() registerEvent = new EventEmitter<FirebaseLoginResponse>();

  public loginForm: FormGroup;
  public login: boolean;

  public focus: boolean;
  public focus4: boolean;

  public focusTouched: boolean;
  public focusTouched4: boolean;

  public registerForm: FormGroup;
  public register: boolean;

  public emailSent: boolean;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildLoginForm();
    this.buildRegisterForm();
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group(
      {
        email: [this.email ? this.email : '', [Validators.required, Validators.email]]
      }
    );
  }

  buildRegisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        email: [this.email ? this.email : '', [Validators.required, Validators.email]]
      }
    );
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  async sendEmailLink() {
    /*
      Attempts to send a sign in link to the email address given by the user.
      Saves the user email to localStorage
    */
    this.login = true;
    if (this.loginForm.invalid) {
      this.alertService.alert('warning-message', 'Oops!', 'Please check your email has been entered correctly or contact support for help.');
      this.login = false;
      return;
    }
    const actionCodeSettings = {
      // redirect URL
      url: this.router.url,
      handleCodeInApp: true,
    };
    try {
      const res = await this.authService.sendSignInLinkToEmail( // send the email signin link
        this.loginF.email.value,
        actionCodeSettings
      );
      localStorage.setItem('emailForSignIn', this.loginF.email.value); // save the email to localStorage to prevent session fixation attacks
      if (res) { // success
        this.emailSent = true;
        this.toastService.showToast('Email sent successfully! Click on the link in the email to log into your Lifecoach account...', 60000, 'success', 'bottom', 'center');
        this.login = false;
        this.analyticsService.sendLoginEmail(this.loginF.email.value);
        return;
      }
      this.alertService.alert(res.message); // error
      this.login = false;
    } catch (err) { // error (should be caught by auth service and passed back in the res above if error)
      this.alertService.alert(err.message);
      this.login = false;
    }
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  async sendEmailLinkRegister() {
    /*
      Attempts to send a sign in link to the email address given by the user.
      Saves the user email to localStorage
    */
    this.register = true;
    if (this.registerForm.invalid) {
      this.alertService.alert('warning-message', 'Oops!', 'Please check your email has been entered correctly or contact support for help.');
      this.register = false;
      return;
    }
    const actionCodeSettings = {
      // redirect URL
      url: this.router.url,
      handleCodeInApp: true,
    };
    try {
      const res = await this.authService.sendSignInLinkToEmail( // send the email signin link
        this.registerF.email.value,
        actionCodeSettings
      );
      localStorage.setItem('emailForSignIn', this.registerF.email.value); // save the email to localStorage to prevent session fixation attacks
      if (res) { // success
        this.emailSent = true;
        this.toastService.showToast('Email sent successfully! Click on the link in the email to log into your new Lifecoach account...', 60000, 'success', 'bottom', 'center');
        this.register = false;
        this.analyticsService.sendLoginEmail(this.registerF.email.value);
        return;
      }
      this.alertService.alert(res.message); // error
      this.register = false;
    } catch (err) { // error (should be caught by auth service and passed back in the res above if error)
      this.alertService.alert(err.message);
      this.register = false;
    }
  }

}
