import { Component, OnInit, Input, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from 'app/services/alert.service';

import { FirebaseLoginResponse } from 'app/interfaces/firebase.login.response.interface';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { DataService } from 'app/services/data.service';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

/*
  This component is designed to offer signup/registration at any point in the app.
  It will send a login email to the user.
  If the user is not already registered in Firebase it will create a new user.
  After clicking the link in the login email it will redirect the user back to the current
  page that this component is loaded in and then process the sign in.
  Once the user is authorised, the component template will be hidden.
*/

@Component({
  selector: 'app-login-in-flow',
  templateUrl: './login-in-flow.component.html',
  styleUrls: ['./login-in-flow.component.scss']
})
export class LoginInFlowComponent implements OnInit, OnDestroy {

  @Input() email: string;
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() showAlert: boolean;
  @Input() alertText: string;

  @Output() loginEvent = new EventEmitter<FirebaseLoginResponse>();
  @Output() registerEvent = new EventEmitter<FirebaseLoginResponse>();

  public user: firebase.User;
  public loginForm: FormGroup;
  public login: boolean;

  public focus: boolean;
  public focus4: boolean;

  public focusTouched: boolean;
  public focusTouched4: boolean;

  public registerForm: FormGroup;
  public register: boolean;

  public emailSent: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService,
    private alertService: AlertService,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildLoginForm();
    this.buildRegisterForm();
    // confirm signin
    const url = document.location.href;
    this.confirmSignIn(url);
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
      url: document.location.href,
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
        this.toastService.showToast('Email sent successfully! Click on the link in the email to log into your Lifecoach account. This will open a new tab. It is now safe to close this browser tab.', 60000, 'success', 'bottom', 'center');
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
      url: document.location.href,
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
        this.toastService.showToast('Email sent successfully! Click on the link in the email to log into your Lifecoach account. This will open a new tab. It is now safe to close this browser tab.', 60000, 'success', 'bottom', 'center');
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

  async confirmSignIn(url) {
    /*
      If the user is returning here from the link in their login email,
      we'll detect the link in the route and action login.
      If not, we'll check if the user is authorised anyway, and hide the template if they are.
    */
    try {
      if (this.authService.isSignInWithEmailLink(url)) {
        let email = window.localStorage.getItem('emailForSignIn');

        // If missing email, prompt user for it
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }

        // Attempt to sign the user in...
        const result = await this.authService.signInWithEmailLink(email, url);

        // sign in sucess!
        this.user = result.user; // the html template will now hide!
        window.localStorage.removeItem('emailForSignIn'); // clean up localStorage

        /*
          Is this user logging in for the first time (post registration)?
          Check firestore to see if we've already created a user node.
          If not, the user must be new so ask for more details to complete registration.
          If the user node exists, they are simply returning, so nav to dashboard...
        */

        this.subscriptions.add(
          this.dataService.getUserAccount(result.user.uid).subscribe(acct => {

            if (acct) { // user account exists...
              this.analyticsService.signIn(result.user.uid, 'Passwordless', email);
              return;
            }

            // user account does NOT exist. Redirect to complete registration page...
            this.analyticsService.gotoCompleteRegistration();
            this.router.navigate(['/register']); // TODO! Perhaps capture register details in flow as well without redirect??
          })
        );

      } else {
        this.subscriptions.add(
          this.authService.getAuthUser().subscribe(user => {
            if (user) {
              this.user = user;
            }
          })
        );
      }
    } catch (err) {
      this.alertService.alert('warning-message', 'Oops!', err.message);
    }
  }

  clickEvent(buttonId: string) {
    this.analyticsService.clickButton(buttonId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
