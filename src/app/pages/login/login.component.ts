import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { ToastService } from 'app/services/toast.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { RegisterModalComponent } from 'app/components/register-modal/register-modal.component';
import { DataService } from 'app/services/data.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;
  private user: Observable<any>;
  public loginForm: FormGroup;
  public login: boolean;
  public loginAttempt: boolean;
  public focusTouched: boolean;
  public emailSent: boolean;
  public objKeys = Object.keys;
  public errorMessages = {
    email: {
      required: 'Please enter your email address',
      email: `Please enter a valid email address`
    }
  };

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private router: Router,
    private modalService: BsModalService,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
  ) {}

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('login-page');

    // Build the login form
    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]]
      }
    );

    // check the user auth state (null if not logged in)
    this.user = this.authService.getAuthUser();

    // confirm signin
    const url = this.router.url;
    this.confirmSignIn(url);
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

  async sendEmailLink() {
    /*
      Attempts to send a sign in link to the email address given by the user.
      Saves the user email to localStorage
    */
    this.login = true;
    this.loginAttempt = true;
    if (this.loginForm.invalid) {
      this.alertService.alert('warning-message', 'Oops!', 'Please check your email has been entered correctly or contact support for help.');
      this.login = false;
      return;
    }
    const actionCodeSettings = {
      // redirect URL
      url: `${environment.baseUrl}/login`,
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
        this.loginAttempt = false;
        this.analyticsService.sendLoginEmail(this.loginF.email.value);
        return;
      }
      this.alertService.alert(res.message); // error
      this.emailSent = false;
      this.login = false;
    } catch (err) { // error (should be caught by auth service and passed back in the res above if error)
      this.alertService.alert(err.message);
      this.login = false;
    }
  }

  async confirmSignIn(url) {
    /*
      If the user is returning here from the link in their login email,
      we'll detect the link in the route and action login
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
        window.localStorage.removeItem('emailForSignIn'); // clean up localStorage

        /*
          Is this user logging in for the first time (post registration)?
          Check firestore to see if we've already created a user node.
          If not, the user must be new so ask for more details to complete registration.
          If the user node exists, they are simply returning, so nav to dashboard...
        */

        this.dataService.getUserAccount(result.user.uid).subscribe(acct => {

          if (acct) { // user account exists...
            this.analyticsService.signIn(result.user.uid, 'Passwordless', email);
            this.router.navigate(['/dashboard']);
            return;
          }

          // user account does NOT exist. Redirect to complete registration page...
          this.analyticsService.gotoCompleteRegistration();
          this.router.navigate(['/register']);
        });

      }
    } catch (err) {
      this.alertService.alert('warning-message', 'Oops!', err.message);
    }
  }

  register() {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Joining Lifecoach is free and only takes seconds!`,
        successMessage: null,
        redirectUrl: '/dashboard',
        accountType: null
      } as any
    };
    this.bsModalRef = this.modalService.show(RegisterModalComponent, config);
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
  }

}
