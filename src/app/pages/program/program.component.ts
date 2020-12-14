import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';
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
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
import { Subscription } from 'rxjs';
import { StripePaymentIntentRequest } from 'app/interfaces/stripe.payment.intent.request';

declare var Stripe: any;

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
  encapsulation: ViewEncapsulation.None // to allow styling to be applied to innerHTML on the description
})
export class ProgramComponent implements OnInit, OnDestroy {

  @ViewChild('loginModal', {static: false}) public loginModal: ModalDirective;
  @ViewChild('registerModal', {static: false}) public registerModal: ModalDirective;
  @ViewChild('payModal', {static: false}) public payModal: ModalDirective;

  public browser: boolean;
  public userId: string;
  public now: number; // unix timestamp at load time
  public userClaims: any;
  public account: UserAccount;
  public clientCurrency: string;
  public clientCountry: string;
  public countries: EmojiCountry[];
  public rates: any;
  private programId: string;
  public program: CoachingProgram;
  public programEnrollments: any;
  public purchasingProgram: boolean;
  public languages: any;
  public totalReviews: number;
  public avgRating: number;
  private referralCode: string;

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
  ) { }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('program-page');
    this.userType = 'regular'; // set the default user type to regular. We could let users select if required.
    this.now = Math.round(new Date().getTime() / 1000); // set now as a unix timestamp

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();

      // Init Stripe.js
      const stripe = Stripe('pk_live_GFTeJnPVGhgVifaASOsjEvXf00faFIpXu2'); // production key, NOT for testing!
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
        if (!this.programId) {
          this.alertService.alert('warning-message', 'Error', 'Missing program ID.');
          return null;
        }
        if (!this.clientCurrency) {
          this.alertService.alert('warning-message', 'Error', 'Missing payment currency.');
          return null;
        }
        if (!this.displayPrice) {
          this.alertService.alert('warning-message', 'Error', 'Missing program price.');
          return null;
        }

        // Safe to proceed..
        this.purchasingProgram = true;
        this.analyticsService.attemptStripePayment();

        // prepare the request object
        const piRequest: StripePaymentIntentRequest = {
          saleItemId: this.programId,
          saleItemType: 'fullProgram',
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
          if (!this.account || !this.account.firstName || !this.account.lastName || !this.account.accountEmail || !this.userId || !this.programId) {
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
            this.purchasingProgram = false;
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
              this.purchasingProgram = false;
              this.analyticsService.completeStripePayment();
              this.analyticsService.enrollInProgram(this.program);

              const result = await this.alertService.alert('success-message', 'Success!', 'You are now enrolled in this program.', 'Go to my programs') as any;
              if (result && result.action) {
                this.router.navigate(['/my-programs']);
              }
            }
          }

        } else { // payment intent result error
          this.payModal.hide();
          this.alertService.alert('warning-message', 'Oops', `${pIntentRes.error}. Please contact support.`);
          this.purchasingProgram = false;
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
    }
    // End of platform browser check

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

    // Check activated route params for program ID
    this.route.params.subscribe(params => {
      this.programId = params.id;

      // Fetch the activated program data
      const PROGRAM_KEY = makeStateKey<any>('program'); // create a key for saving/retrieving program state

      const programData = this.transferState.get(PROGRAM_KEY, null as any); // checking if program data in the storage exists

      if (programData === null) { // if program state data does not exist - retrieve it from the api

        // Try to retrieve a public program
        console.log('Checking for public program...');
        this.subscriptions.add(
          this.dataService.getPublicProgram(this.programId).subscribe(publicProgram => {
            if (publicProgram) { // public program exists
              // set the program
              this.program = publicProgram;
              console.log('Public program found:', this.program);
              // update meta
              this.updateProgramMeta();

              // ssr
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(PROGRAM_KEY, publicProgram as any);
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

                // monitor total public program enrollments
                this.subscriptions.add(
                  this.dataService.getTotalPublicEnrollmentsByProgram(this.programId).subscribe(enrollments => {
                    if (enrollments) {
                      this.programEnrollments = enrollments;
                    }
                  })
                );

                // check for referral code
                this.checkForReferralCode();
              }

            } else { // No public program exists.
              // Try to retrieve a private program if the user is authorised and
              // trying to preview their own program. Not required for SSR.
              if (isPlatformBrowser(this.platformId) && !this.program) {
                console.log('Public program not found. Checking if private preview allowed...');
                this.subscriptions.add(
                  this.authService.getAuthUser().subscribe(user => { // check if user is authorised
                    if (user) { // user is authorised
                      console.log('User is authorised...');
                      this.userId = user.uid;
                      this.subscriptions.add(
                        this.dataService.getPrivateProgram(this.userId, this.programId).subscribe(privateProgram => { // check for private program
                          if (privateProgram) { // private program exists
                            console.log('Private program found:', privateProgram);
                            this.program = privateProgram;

                            // update meta
                            this.updateProgramMeta();

                          } else { // private program not found
                            console.log('Private program not found!');
                            this.redirectToBrowsePrograms();
                          }
                        })
                      );
                    } else { // user not authorised
                      console.log('User not authorised to view private program!');
                      this.redirectToBrowsePrograms();
                    }
                  })
                );

                // monitor total public program enrollments
                this.subscriptions.add(
                  this.dataService.getTotalPublicEnrollmentsByProgram(this.programId).subscribe(enrollments => {
                    if (enrollments) {
                      this.programEnrollments = enrollments;
                    }
                  })
                );

              } else { // platform is server and no program retrieved
                this.redirectToBrowsePrograms();
              }
            }
          })
        );

      } else { // if program state data exists retrieve it from the state storage
        this.program = programData;
        this.transferState.remove(PROGRAM_KEY);
      }
    });

  }
  // End of ngOnInit

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

  updateProgramMeta() {
    // Build dynamic meta tags
    this.titleService.setTitle(`${this.program.title}`);
    this.metaTagService.updateTag({name: 'description', content: `${this.program.subtitle} | Personal Development & Transformation 1-to-1 online coaching programs from Lifecoach.io`}, `name='description'`);
    this.metaTagService.updateTag({
      property: 'og:title', content: `${this.program.title}`
    }, `property='og:title'`);
    this.metaTagService.updateTag({
      property: 'og:description', content: `${this.program.subtitle}`
    }, `property='og:description'`);
    this.metaTagService.updateTag({
      property: 'og:image:url', content: this.program.image ? this.program.image : this.program.coachPhoto
    }, `property='og:image:url'`);
  }

  checkForReferralCode() {
    // check the activated route for a referral code query param
    this.route.queryParams.subscribe(params => {
      if (params.referralCode) {
        console.log('referral code detected in active route:', params.referralCode);
        this.referralCode = params.referralCode;
        localStorage.setItem(`program_referral_code_${this.program.programId}`, params.referralCode);
      } else {
        // no param in the active route for this session
        // check local storage for a saved cross-session referral code
        const savedReferralCode = localStorage.getItem(`program_referral_code_${this.program.programId}`);
        if (!savedReferralCode) { // no code found in cross session storage
          return;
        }
        // user has a referral code in storage from a previous session
        console.log('Referral code for this program found in local storage from previous session:', savedReferralCode);
        this.referralCode = savedReferralCode;
      }
    });
  }

  redirectToBrowsePrograms() {
    this.router.navigate(['/programs']);
  }

  onManualCurrencyChange(ev: string) {
    console.log('User changed currency to:', ev);
    this.clientCurrency = ev;
  }

  get displayPrice() {
    if (!this.program.fullPrice || !this.rates || !this.program.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.program.currency === this.clientCurrency) { // no conversion needed
      return this.program.fullPrice;
    }

    amount = Number((this.program.fullPrice / this.rates[this.program.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

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
        this.alertService.alert('success-message', 'Success!', `Welcome to Lifecoach ${firstName}. Click 'Buy Now' again to complete your enrollment...`);
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
        this.alertService.alert('success-message', 'Login Successful', `Click 'Buy Now' again to complete your enrollment...`);
        this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
      } else {
        // Login error.
        this.login = false;
        // Check auth provider error codes.
        if (res.error.code === 'auth/wrong-password') {
          this.alertService.alert('warning-message', 'Oops', 'Incorrect password. Please try again.');
        } else if (res.error.code === 'auth/user-not-found') {
          this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
        } else {
          // Fall back for unknown / no error code
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('program-page');
  }

}