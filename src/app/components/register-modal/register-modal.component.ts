import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AuthService } from 'app/services/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AlertService } from 'app/services/alert.service';
import { LoginComponent } from '../login/login.component';

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
  public configData: any; // not using

  // component
  private userId: string;
  public userType: string;
  public registerForm: FormGroup;
  public register = false;
  public rfocusTouched = false;
  public rfocusTouched1 = false;
  public rfocusTouched2 = false;
  public rfocusTouched3 = false;
  public registerAttempt: boolean;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.userType = 'regular';
    this.buildRegisterForm();
  }

  buildRegisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    );
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  async onRegister() {
    this.registerAttempt = true;
    // Check we have captured a user type
    // console.log('User type to register:', this.userType);
    if (!this.userType) {
      alert('Invalid user type');
      return;
    }
    // Check form validity
    if (this.registerForm.valid) {
      this.register = true;
      // Create new account object
      const newUserAccount: UserAccount = {
        accountEmail: this.registerF.email.value,
        password: this.registerF.password.value,
        accountType: this.userType as any,
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
        this.userId = response.result.user.uid;
        this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
        this.bsModalRef.hide();
        this.alertService.alert('success-message', 'Success!', `Welcome to Lifecoach ${firstName}. You can now schedule a call with this Coach.`);
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
      this.registerAttempt = false;
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
    }
  }

  login() {
    // pop login modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        anyData: null
      } as any
    };
    this.bsModalRef = this.modalService.show(LoginComponent, config);
  }

}
