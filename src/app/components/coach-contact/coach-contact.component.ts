import { Component, OnInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { AlertService } from 'app/services/alert.service';
import { ToastService } from 'app/services/toast.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';

import { FirebaseLoginResponse } from 'app/interfaces/firebase.login.response.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coach-contact',
  templateUrl: './coach-contact.component.html',
  styleUrls: ['./coach-contact.component.scss']
})
export class CoachContactComponent implements OnInit {

  @Input() coachUid: string;

  public userId: string;

  public contactForm: FormGroup;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focus3: boolean;

  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;
  public focus3Touched: boolean;

  public submitted: boolean;
  public loginRequired: boolean;
  public sendingMessage: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private formBuilder: FormBuilder,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private alertService: AlertService,
    private cloudFunctionsService: CloudFunctionsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
      this.buildContactForm();
      this.getUser();
    }
  }

  buildContactForm() {
    this.contactForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: [
        '',
        [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
      ],
      message: ['', [Validators.required]],
      recaptchaReactive: [null, [Validators.required]]
    });
  }

  get contactF(): any {
    return this.contactForm.controls;
  }

  recaptchaResolved(event: any) {
    console.log('reCaptchaEvent', event);
  }

  getUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            // Remove the form controls we don't need when user is authorised
            this.contactForm.removeControl('firstName');
            this.contactForm.removeControl('lastName');
            this.contactForm.removeControl('email');
          }
        })
    );
  }

  async postMsg() {
    return this.cloudFunctionsService.postNewMessage(this.userId, this.coachUid, this.contactF.message.value, null) as any;
  }

  resetForm() {
    this.submitted = false;
    this.focusTouched = false;
    this.focus1Touched = false;
    this.focus2Touched = false;
    this.focus3Touched = false;
    this.contactForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      recaptchaReactive: null
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.submitted = true;
      if (this.userId) {
        this.analyticsService.contactCoach(this.coachUid);
        // User is authenticated. Send message.
        const res = await this.postMsg();
        if (res.success) {
          this.submitted = false;
          await this.alertService.alert('success-message', 'Success!', `
          Message sent successfully! Visit 'My Dashboard > Messages' to see replies.
          If this Coach takes a little while to respond, we'll send you an email as soon as they reply.`);
          this.resetForm();
        } else if (res.error) {
          this.submitted = false;
          await this.alertService.alert('warning-message', 'Oops', `
          Something went wrong. Error: ${JSON.stringify(res.error)}`);
        }
      } else {
        // User is not authenticated. Require login or register to send message.
        this.submitted = false;
        this.loginRequired = true; // will trigger 'login-in-flow.component'
        await this.alertService.alert('info-message', 'Just a second...', `You must be logged in
        to contact coaches. If you're new to Lifecoach, signing up is totally FREE and only takes a second...`, 'OK');
      }
    } else {
      console.log('Invalid contact form!');
    }
  }

  async onUserAuth(event: FirebaseLoginResponse) { // Fires if the child 'login-in-flow.component' emits a login response
    if (event.result.user.uid) { // Now user is authenticated, continue sending message
      this.userId = event.result.user.uid;
      this.contactForm.patchValue({recaptchaReactive: null});
      this.loginRequired = false;
      this.sendingMessage = true;
      this.submitted = true;
      const res = await this.postMsg();
      if (res.success) { // message sent successfully
        this.submitted = false;
        await this.alertService.alert('success-message', 'Success!', `
        Message sent successfully! Visit 'My Dashboard > Messages' to see replies.
        If this Coach takes a little while to respond, we'll send you an email as soon as they reply.`);
        this.resetForm();
        this.router.navigate(['/dashboard']);
      } else if (res.error) { // error sending message
        this.submitted = false;
        await this.alertService.alert('warning-message', 'Oops', `
        Something went wrong. Error: ${JSON.stringify(res.error)}`);
      }
    }
  }

}
