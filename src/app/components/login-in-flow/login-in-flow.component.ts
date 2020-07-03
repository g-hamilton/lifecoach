import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from 'app/services/alert.service';

import { UserAccount } from '../../interfaces/user.account.interface';
import { FirebaseLoginResponse } from 'app/interfaces/firebase.login.response.interface';

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
  public focus1: boolean;
  public focus2: boolean;
  public focus3: boolean;
  public focus4: boolean;
  public focus5: boolean;

  public focusTouched: boolean;
  public focusTouched1: boolean;
  public focusTouched2: boolean;
  public focusTouched3: boolean;
  public focusTouched4: boolean;
  public focusTouched5: boolean;

  public registerForm: FormGroup;
  public register: boolean;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.buildLoginForm();
    this.buildRegisterForm();
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group(
      {
        email: [this.email ? this.email : '', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }
    );
  }

  buildRegisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: [this.firstName ? this.firstName : '', [Validators.required]],
        lastName: [this.lastName ? this.lastName : '', [Validators.required]],
        email: [this.email ? this.email : '', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        termsAccepted: [false, Validators.pattern('true')]
      }
    );
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  async onLogin() {

    if (this.loginForm.valid) {
      this.login = true;
      const account: UserAccount = {
        accountEmail: this.loginF.email.value,
        password: this.loginF.password.value,
        accountType: null
      };
      const res = await this.authService.signInWithEmailAndPassword(account);

      if (!res.error) { // successful login

        this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
        this.loginEvent.emit(res); // emit the login response

      } else { // error logging in

        this.login = false;
        // Check auth provider error codes.
        if (res.error.code === 'auth/wrong-password') {
          this.toastService.showToast('Oops! Incorrect password. Please try again.', 0, 'danger');
        } else if (res.error.code === 'auth/user-not-found') {
          this.toastService.showToast('Oops! Email address not found. Please check your login email address is correct.', 0, 'danger');
        } else {
          // Fall back for unknown / no error code
          // tslint:disable-next-line: max-line-length
          this.toastService.showToast('Oops! Something went wrong. Please try again or contact hello@lifecoach.io for assistance.', 0, 'danger');
        }
      }
    } else {
      this.toastService.showToast('Please complete all required fields.', 0, 'danger');
    }
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
        accountType: 'regular',
        firstName: this.registerF.firstName.value,
        lastName: this.registerF.lastName.value
      };

      // Attempt registration
      const response = await this.authService.createUserWithEmailAndPassword(newUserAccount);

      if (!response.error) { // Successful registration

        this.register = false;
        this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
        this.registerEvent.emit(response);

      } else { // Registration error

        this.register = false;
        if (response.error.code === 'auth/email-already-in-use') {
          this.toastService.showToast('Oops! That email is already registered. Please log in.', 0, 'danger');
        } else if (response.error.code === 'auth/invalid-email') {
          this.toastService.showToast('Oops! Invalid email address. Please try a different email.', 0, 'danger');
        } else if (response.error.code === 'auth/weak-password') {
          this.toastService.showToast('Oops! Password is too weak. Please use a stronger password.', 0, 'danger');
        } else {
          this.toastService.showToast('Oops! Something went wrong. Please contact hello@lifecoach.io for help', 0, 'danger');
        }
      }
    } else {
      this.toastService.showToast('Please complete all required fields.', 5000, 'danger');
    }
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
