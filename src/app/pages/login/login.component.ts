import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { ToastService } from 'app/services/toast.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private user: Observable<any>;
  public loginForm: FormGroup;
  public login: boolean;
  public loginAttempt: boolean;
  public focusTouched: boolean;
  public emailSent = false;
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
    private router: Router
  ) {}

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
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
        this.toastService.showToast('Email sent successfully!', 10000, 'success', 'bottom', 'center');
        this.login = false;
        this.loginAttempt = false;
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

        // Signin user and remove the email localStorage
        const result = await this.authService.signInWithEmailLink(email, url);
        window.localStorage.removeItem('emailForSignIn');
        this.router.navigate(['/dashboard']);
      }
    } catch (err) {
      this.alertService.alert('warning-message', 'Oops!', err.message);
    }
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
  }

}
