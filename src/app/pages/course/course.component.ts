import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';

declare var Stripe: any;

import { AnalyticsService } from 'app/services/analytics.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { CountryService } from 'app/services/country.service';
import { EmojiCountry } from 'app/interfaces/emoji.country.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
import { Subscription } from 'rxjs';
import { StripePaymentIntentRequest } from 'app/interfaces/stripe.payment.intent.request';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-course',
  templateUrl: 'course.component.html',
  styleUrls: ['./course.component.scss'],
  encapsulation: ViewEncapsulation.None // to allow styling to be applied to innerHTML on the description
})
export class CourseComponent implements OnInit, OnDestroy {

  @ViewChild('loginModal', {static: false}) public loginModal: ModalDirective;
  @ViewChild('registerModal', {static: false}) public registerModal: ModalDirective;
  @ViewChild('payModal', {static: false}) public payModal: ModalDirective;

  public browser: boolean;
  public now: number; // unix timestamp at load time

  public userId: string;
  public userClaims: any;
  public account: UserAccount;
  public clientCurrency: string;
  public clientCountry: string;
  public countries: EmojiCountry[];
  public rates: any;
  private courseId: string;
  public course: CoachingCourse;
  public courseEnrollments: any;

  public purchasingCourse: boolean;

  public loginForm: FormGroup;
  public login = false;
  public lfocusTouched = false;
  public lfocusTouched1 = false;

  public userType: string;
  public registerForm: FormGroup;
  public register = false;
  public rfocusTouched = false;
  public rfocusTouched1 = false;
  public rfocusTouched2 = false;
  public rfocusTouched3 = false;

  public languages: any;

  public totalReviews: number;
  public avgRating: number;

  private referralCode: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaTagService: Meta,
    private transferState: TransferState,
    private analyticsService: AnalyticsService,
    private cloudFunctionsService: CloudFunctionsService,
    private alertService: AlertService,
    private dataService: DataService,
    private authService: AuthService,
    private currenciesService: CurrenciesService,
    private countryService: CountryService,
    public formBuilder: FormBuilder,
    private languagesService: IsoLanguagesService
  ) {
  }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('course-page');
    this.userType = 'regular'; // set the default user type to regular. We could let users select if required.
    this.now = Math.round(new Date().getTime() / 1000); // set now as a unix timestamp

    if (isPlatformBrowser(this.platformId)) {

      this.browser = true;

      this.analyticsService.pageView();

      // Init Stripe.js
      const stripe = Stripe(`${environment.stripeCourseKey}`); // production key, NOT for testing!
      // const stripe = Stripe('pk_test_HtSpdTqwGC86g7APo4XLBgms00TVXJLOf8'); // test key, NOT for prod!

      // Init Stripe Elements
      const elements = stripe.elements();
      const style = {
        base: {
          color: '#32325d',
        }
      };
      const card = elements.create('card', {style});
      card.mount('#card-element');
      card.addEventListener('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      });

      // Listen to Stripe Elements form for payment intention
      const form = document.getElementById('payment-form');

      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        // Check for all necessary payment data before calling for payment intent
        if (!this.courseId) {
          this.alertService.alert('warning-message', 'Error', 'Missing course ID.');
          return null;
        }
        if (!this.clientCurrency) {
          this.alertService.alert('warning-message', 'Error', 'Missing payment currency.');
          return null;
        }
        if (!this.displayPrice) {
          this.alertService.alert('warning-message', 'Error', 'Missing course price.');
          return null;
        }

        // Safe to proceed..
        this.purchasingCourse = true;
        this.analyticsService.attemptStripePayment();

        // prepare the request object
        const piRequest: StripePaymentIntentRequest = {
          saleItemId: this.courseId,
          saleItemType: 'ecourse',
          salePrice: this.displayPrice,
          currency: this.clientCurrency,
          buyerUid: this.userId,
          referralCode: this.referralCode ? this.referralCode : null
        };

        // request the payment intent
        const pIntentRes = await this.cloudFunctionsService.getStripePaymentIntent(piRequest) as any;

        console.log('Payment Intent created', pIntentRes.stripePaymentIntent);

        if (pIntentRes && !pIntentRes.error) { // payment intent success

          // Check we have valid user data for billing details
          if (!this.account || !this.account.firstName || !this.account.lastName || !this.account.accountEmail || !this.userId || !this.courseId) {
            // alert
            this.alertService.alert('warning-message', 'Warning: Missing user data for billing details. Please contact support.');
            return null;
          }

          // Call Stripe to confirm payment
          const res = await stripe.confirmCardPayment(pIntentRes.stripePaymentIntent.client_secret, {
            payment_method: {
              card,
              billing_details: {
                name: `${this.account.firstName} ${this.account.lastName}`,
                email: this.account.accountEmail
              }
            },
            receipt_email: this.account.accountEmail
          });

          // console.log(res);

          if (res.error) { // error confirming payment
            console.log('Result error:', res.error);
            // Show error to your customer (e.g., insufficient funds)
            this.alertService.alert('warning-message', 'Oops', `${res.error.message}`);
            this.purchasingCourse = false;
            this.analyticsService.failStripePayment();

          } else { // success confirming payment
            // The payment has been processed!
            if (res.paymentIntent.status === 'succeeded') {
              console.log('Payment succeeded!');
              // Show a success message to your customer
              // There's a risk of the customer closing the window before callback
              // execution. Set up a webhook or plugin to listen for the
              // payment_intent.succeeded event that handles any business critical
              // post-payment actions.

              this.payModal.hide();
              this.purchasingCourse = false;
              this.analyticsService.completeStripePayment();
              this.analyticsService.enrollInCourse(this.course);

              const result = await this.alertService.alert('success-message', 'Success!', 'You have now purchased this course.', 'Go To Courses') as any;
              if (result && result.action) {
                this.router.navigate(['/my-courses']);
              }
            }
          }

        } else { // payment intent result error
          this.payModal.hide();
          this.alertService.alert('warning-message', 'Oops', `${pIntentRes.error}`);
          this.purchasingCourse = false;
        }

      });
      // End of Stripe related code

      // Check for saved client currency & country preference
      const savedClientCurrencyPref = localStorage.getItem('client-currency');
      const savedClientCountryPref = localStorage.getItem('client-country');
      if (savedClientCurrencyPref && savedClientCountryPref) {
        this.clientCurrency = savedClientCurrencyPref;
        this.clientCountry = savedClientCountryPref;
      } else {
        this.getClientCurrencyAndCountryFromIP();
      }

      // Build the register form
      this.registerForm = this.formBuilder.group(
        {
          firstName: ['', [Validators.required]],
          lastName: ['', [Validators.required]],
          email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
          password: ['', [Validators.required, Validators.minLength(6)]]
        }
      );

      // Build the login form
      this.loginForm = this.formBuilder.group(
        {
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(6)]],
        }
      );

    } // End of platform browser

    // Monitor platform rates for realtime price calculations
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          // console.log('Rates:', rates);
          this.rates = rates;
        }
      })
    );

    // Import list of countries
    this.countries = this.countryService.getCountryList();

    // Import languages
    this.languages = this.languagesService.getLanguagesJson();

    // Check activated route params for course ID
    this.route.params.subscribe(params => {
      this.courseId = params.id;

      // Fetch the activated course data
      const COURSE_KEY = makeStateKey<any>('course'); // create a key for saving/retrieving course state

      const courseData = this.transferState.get(COURSE_KEY, null as any); // checking if course data in the storage exists

      if (courseData === null) { // if course state data does not exist - retrieve it from the api

        // Try to retrieve a public course
        this.subscriptions.add(
          this.dataService.getPublicCourse(this.courseId).subscribe(publicCourse => {
            if (publicCourse) { // public course exists
              // reset section expanded UI properties on all course sections
              publicCourse.sections.forEach((s: any, index: number) => {
                index === 0 ? s.expanded = true : s.expanded = false; // auto expand only the first section
              });
              // set the course
              this.course = publicCourse;
              console.log(this.course);
              // update meta
              this.updateCourseMeta();

              // ssr
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(COURSE_KEY, publicCourse as any);
              }

              // browser only
              if (isPlatformBrowser(this.platformId)) {
                // Monitor user data
                this.subscriptions.add(
                  this.authService.getAuthUser().subscribe(user => { // check if user authorised
                    console.log('User:', user);
                    if (user) { // user is authorised
                      this.userId = user.uid;
                      user.getIdTokenResult(true).then(token => this.userClaims = token.claims); // retrieve user auth claims
                      this.dataService.getUserAccount(this.userId).subscribe(account => { // check for user account data
                        if (account) { // account data exists
                          this.account = account;
                        }
                      });
                    }
                  })
                );

                // monitor total public course enrollments
                this.subscriptions.add(
                  this.dataService.getTotalPublicEnrollmentsByCourse(this.courseId).subscribe(enrollments => {
                    if (enrollments) {
                      this.courseEnrollments = enrollments;
                    }
                  })
                );

                // check for referral code
                this.checkForReferralCode();
              }

            } else { // No public course exists.
              // Try to retrieve a private course if the user is authorised and
              // trying to preview their own course. Not required for SSR.
              if (isPlatformBrowser(this.platformId) && !this.course) {
                console.log('Public course not found. Checking if private preview allowed...');
                this.subscriptions.add(
                  this.authService.getAuthUser().subscribe(user => { // check if user is authorised
                    if (user) { // user is authorised
                      this.userId = user.uid;
                      this.subscriptions.add(
                        this.dataService.getPrivateCourse(this.userId, this.courseId).subscribe(privateCourse => { // check for private course
                          if (privateCourse) { // private course exists
                            this.course = privateCourse;

                            // update meta
                            this.updateCourseMeta();

                          } else { // private course not found
                            console.log('Private course not found!');
                            this.redirectToBrowseCourses();
                          }
                        })
                      );
                    } else { // user not authorised
                      console.log('User not authorised to view private course!');
                      this.redirectToBrowseCourses();
                    }
                  })
                );

                // monitor total public course enrollments
                this.subscriptions.add(
                  this.dataService.getTotalPublicEnrollmentsByCourse(this.courseId).subscribe(enrollments => {
                    if (enrollments) {
                      this.courseEnrollments = enrollments;
                    }
                  })
                );

              } else { // platform is server and no course retreived
                this.redirectToBrowseCourses();
              }
            }
          })
        );

      } else { // if course state data exists retrieve it from the state storage
        this.course = courseData;
        this.transferState.remove(COURSE_KEY);
      }
    });

  } // end of onInit

  checkForReferralCode() {
    // check the activated route for a referral code query param
    this.route.queryParams.subscribe(params => {
      if (params.referralCode) {
        console.log('referral code detected in active route:', params.referralCode);
        this.referralCode = params.referralCode;
        localStorage.setItem(`course_referral_code_${this.course.courseId}`, params.referralCode);
      } else {
        // no param in the active route for this session
        // check local storage for a saved cross-session referral code
        const savedReferralCode = localStorage.getItem(`course_referral_code_${this.course.courseId}`);
        if (!savedReferralCode) { // no code found in cross session storage
          return;
        }
        // user has a referral code in storage from a previous session
        console.log('Referral code for this course found in local storage from previous session:', savedReferralCode);
        this.referralCode = savedReferralCode;
      }
    });
  }

  redirectToBrowseCourses() {
    this.router.navigate(['/courses']);
  }

  updateCourseMeta() {
    // Build dynamic meta tags
    this.titleService.setTitle(`${this.course.title}`);
    this.metaTagService.updateTag({name: 'description', content: `${this.course.subtitle} | Discover leading online coaching courses from Lifecoach.io`}, `name='description'`);
    this.metaTagService.updateTag({
      property: 'og:title', content: `${this.course.title}`
    }, `property='og:title'`);
    this.metaTagService.updateTag({
      property: 'og:description', content: `${this.course.subtitle}`
    }, `property='og:description'`);
    this.metaTagService.updateTag({
      property: 'og:image:url', content: this.course.image ? this.course.image : this.course.coachPhoto
    }, `property='og:image:url'`);
  }

  async getClientCurrencyAndCountryFromIP() {
    const res = await fetch('https://ipapi.co/json/');
    // console.log(res.status);
    if (res.status === 200) {
      const json = await res.json();
      if (json.currency) {
        this.clientCurrency = json.currency;
        localStorage.setItem('client-currency', String(json.currency));
      }
      if (json.country) {
        this.clientCountry = json.country;
        localStorage.setItem('client-country', String(json.country));
      }
    }
  }

  onManualCurrencyChange(ev: string) {
    console.log('User changed currency to:', ev);
    this.clientCurrency = ev;
  }

  get displayPrice() {
    if (!this.course.price || !this.rates || !this.course.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.course.currency === this.clientCurrency) { // no conversion needed
      return this.course.price;
    }

    // tslint:disable-next-line: max-line-length
    amount = Number((this.course.price / this.rates[this.course.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

    if (!Number.isInteger(amount)) { // if price is not an integer
      const rounded = Math.floor(amount) + .99; // round UP to .99
      amount = rounded;
    }

    return amount;
  }

  get currencySymbol() {
    const c = this.currenciesService.getCurrencies();
    if (c != null) {
      return c[this.clientCurrency].symbol;
    }
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
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

  async onRegister() {
    // Check we have captured a user type
    console.log('User type to register:', this.userType);
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
        this.userId = response.result.user.uid; // update the component userId to allow user to purchase
        this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
        this.registerModal.hide();
        if (this.course.pricingStrategy === 'paid') {
          this.alertService.alert('success-message', 'Success!', `Welcome to Lifecoach ${firstName}. Click 'Buy Now' again to complete your purchase...`);
        } else {
          this.alertService.alert('success-message', 'Success!', `Welcome to Lifecoach ${firstName}. Click 'Enroll' again to complete your enrollment...`);
        }
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
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
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
        this.userId = res.result.user.uid; // update the component userId to allow user to purchase
        this.loginModal.hide();
        if (this.course.pricingStrategy === 'paid') {
          this.alertService.alert('success-message', 'Login Successful', `Click 'Buy Now' again to complete your purchase...`);
        } else {
          this.alertService.alert('success-message', 'Login Successful', `Click 'Enroll' again to complete your enrollment...`);
        }
        this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
      } else {
        // Login error.
        this.login = false;
        // Check auth provider error codes.
        if (res.error.code === 'auth/wrong-password') {
          this.alertService.alert('warning-message', 'Oops', 'Incorrect password. Please try again.');
        } else if (res.error.code === 'auth/user-not-found') {
          // tslint:disable-next-line: max-line-length
          this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
        } else {
          // Fall back for unknown / no error code
          // tslint:disable-next-line: max-line-length
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please try again or contact hello@lifecoach.io for assistance.');
        }
      }
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
    }
  }

  onAvgRatingEvent(event: number) {
    this.avgRating = event;
  }

  onTotalReviewsEvent(event: number) {
    this.totalReviews = event;
    // console.log('Total reviews event:', event);
  }

  async enrollFree() {
    this.purchasingCourse = true;
    this.analyticsService.attemptFreeCourseEnrollment();
    const res = await this.cloudFunctionsService.completeFreeCourseEnrollment(this.courseId, this.userId, this.referralCode) as any;
    if (res.error) { // error enrolling in course
      this.alertService.alert('warning-message', 'Oops', `${res.error}`);
      return;
    }

    this.purchasingCourse = false;
    this.analyticsService.enrollInCourse(this.course);
    const result = await this.alertService.alert('success-message', 'Success!', 'You have now enrolled in this course.', 'Go To Courses') as any;
    if (result && result.action) {
      this.router.navigate(['/my-courses']);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('course-page');
  }

}
