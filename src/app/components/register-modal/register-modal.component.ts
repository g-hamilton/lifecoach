import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AuthService } from 'app/services/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AlertService } from 'app/services/alert.service';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { ToastService } from 'app/services/toast.service';

/*
  This component is designed to be a re-usable modal.
  Allows users to register from multiple places in the app's UI
*/

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent implements OnInit {

  // modal config - pass any data in through the modalOptions
  public message: string; // any message to display on the UI?
  private successMessage: string; // any message to display after successful register?
  private redirectUrl: string; // if we need to redirect the user, pass a full/partial url
  public plan: 'trial' | 'spark' | 'flame' | 'blaze'; // if registering coach - billing plan
  public accountType: 'regular' | 'coach' | 'partner' | 'provider';

  // component
  public registerForm: FormGroup;
  public register = false;
  public rfocusTouched1 = false;
  public registerAttempt: boolean;
  public emailSent: boolean;

  public objKeys = Object.keys;

  public errorMessages = {
    email: {
      required: 'Please enter your email address',
      email: `Please enter a valid email address`
    }
  };

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private router: Router,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.buildRegisterForm();
  }

  buildRegisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]]
      }
    );
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
    // console.log(this.registerForm.value);
    // Check form validity
    if (this.registerForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
      return;
    }

    const email = this.registerF.email.value;

    if (this.plan) { // if we've captured a desired billing plan, save it to localStorage
      localStorage.setItem('lifecoachBillingPlan', this.plan);
    }

    if (this.accountType) { // if we've captured a user account type, save it to localStorage
      localStorage.setItem('lifecoachAccountType', this.accountType);
    }

    /*
      Passwordless auth...
      Attempt to send a sign in link to the email address given by the user.
      Saves the user email to localStorage
      Creates the auth user in Firebase
    */
    const actionCodeSettings = {
      // redirect URL
      url: `${environment.baseUrl}/login`,
      handleCodeInApp: true,
    };

    try {
      const res = await this.authService.sendSignInLinkToEmail( // send the email signin link
        email,
        actionCodeSettings
      );
      localStorage.setItem('emailForSignIn', email); // save the email to localStorage to prevent session fixation attacks
      if (res) { // success
        this.emailSent = true;
        this.bsModalRef.hide();
        this.register = false;
        this.registerAttempt = false;
        this.toastService.showToast(`We've sent an email to confirm your address. Please click the link in your email to complete sign up...`, 60000, 'success', 'bottom', 'center');
        this.analyticsService.sendLoginEmail(email);
        return;
      }
      this.alertService.alert(res.message); // error
      this.emailSent = false;
      this.register = false;
    } catch (err) { // error (should be caught by auth service and passed back in the res above if error)
      this.alertService.alert(err.message);
      this.register = false;
    }

  }

  login() {
    if (this.router.url.includes('/login')) {
      return;
    }
    // pop login modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: null,
        successMessage: null,
        redirectUrl: null
      } as any
    };
    this.bsModalRef = this.modalService.show(LoginComponent, config);
  }

}
