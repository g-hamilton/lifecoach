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
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { RegisterModalComponent } from 'app/components/register-modal/register-modal.component';

@Component({
  selector: 'app-course',
  templateUrl: 'course.component.html',
  styleUrls: ['./course.component.scss'],
  encapsulation: ViewEncapsulation.None // to allow styling to be applied to innerHTML on the description
})
export class CourseComponent implements OnInit, OnDestroy {

  @ViewChild('payModal', {static: false}) public payModal: ModalDirective;

  public bsModalRef: BsModalRef;

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
    private languagesService: IsoLanguagesService,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    console.log(this.router);

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('course-page');
    this.now = Math.round(new Date().getTime() / 1000); // set now as a unix timestamp

    if (isPlatformBrowser(this.platformId)) {

      this.browser = true;

      this.analyticsService.pageView();

      // Init Stripe.js
      const stripe = Stripe(`${environment.stripeJsClientKey}`);

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
              // console.log(this.course);
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
                    // console.log('User:', user);
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
      // console.log(this.course);
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

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  onRegister() {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Just a second! You need a Lifecoach account to purchase & watch eCourses. Joining Lifecoach is free and only takes seconds!`,
        successMessage: `Click Buy Now again to complete your purchase.`,
        redirectUrl: null
      } as any
    };
    this.bsModalRef = this.modalService.show(RegisterModalComponent, config);
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
