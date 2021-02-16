import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
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
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
import { Subscription } from 'rxjs';
import { StripePaymentIntentRequest } from 'app/interfaces/stripe.payment.intent.request';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ScheduleCallComponent } from 'app/components/schedule-call/schedule-call.component';
import {take} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import { RegisterModalComponent } from 'app/components/register-modal/register-modal.component';
import { PartnerTrackingService } from 'app/services/partner-tracking.service';

declare var Stripe: any;

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
  // encapsulation: ViewEncapsulation.None // to allow styling to be applied to innerHTML on the description // I'm not sure, but looks like this is redundant
})
export class ProgramComponent implements OnInit, OnDestroy {

  @ViewChild('payModal', {static: false}) public payModal: ModalDirective;

  public bsModalRef: BsModalRef;

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
  private partnerTrackingCode: string | null; // will hold a partner tracking code if a promotional partner referred the user anywhere on the app within the last 30 days
  public purchaseType: 'full' | 'session'; // value should be set depending on which purchase button is pressed

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
    private modalService: BsModalService,
    private toastrService: ToastrService,
    private partnerTrackingService: PartnerTrackingService
  ) { }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('program-page');
    this.now = Math.round(new Date().getTime() / 1000); // set now as a unix timestamp

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();

      this.checkStoredPartnerTrackingCode();

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
        if (!this.programId) {
          this.alertService.alert('warning-message', 'Error', 'Missing program ID.');
          return null;
        }
        if (!this.clientCurrency) {
          this.alertService.alert('warning-message', 'Error', 'Missing payment currency.');
          return null;
        }
        if (!this.displayFullPrice) {
          this.alertService.alert('warning-message', 'Error', 'Missing program full price.');
          return null;
        }

        // Safe to proceed..
        this.purchasingProgram = true;
        this.analyticsService.attemptStripePayment();

        // prepare the request object
        const piRequest: StripePaymentIntentRequest = {
          saleItemId: this.programId,
          saleItemType: this.purchaseType === 'full' ? 'fullProgram' : 'programSession',
          salePrice: this.purchaseType === 'full' ? this.displayFullPrice : this.displaySessionPrice,
          currency: this.clientCurrency,
          buyerUid: this.userId,
          referralCode: this.referralCode ? this.referralCode : null,
          partnerTrackingCode: this.partnerTrackingCode ? this.partnerTrackingCode : null
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

  checkStoredPartnerTrackingCode() {
    // inspect localstorage for a saved partner tracking code.
    // if a valid tracking code is found, update the component
    // so any purchase can place the code in a payment intent

    const validTrackingCode = this.partnerTrackingService.checkForSavedPartnerTrackingCode();
    if (validTrackingCode) {
      this.partnerTrackingCode = validTrackingCode;
    }
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

  get displayFullPrice() {
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

  get displaySessionPrice() {
    if (!this.program.pricePerSession || !this.rates || !this.program.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.program.currency === this.clientCurrency) { // no conversion needed
      return this.program.pricePerSession;
    }

    amount = Number((this.program.pricePerSession / this.rates[this.program.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

    if (!Number.isInteger(amount)) { // if price is not an integer
      const rounded = Math.floor(amount) + .99; // round UP to .99
      amount = rounded;
    }

    return amount;
  }

  get currencySymbol() {
    const c = this.currenciesService.getCurrencies();
    if (!this.clientCurrency) {
      return '';
    }
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

  openScheduleCallModal() {
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        coachId: this.program.sellerUid
      }
    };
    this.bsModalRef = this.modalService.show(ScheduleCallComponent, config);
  }

  registerToDiscover() {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Just a second! You need a Lifecoach account to schedule Discovery sessions with coaches. Joining Lifecoach is free and only takes seconds!`,
        successMessage: `Click Schedule a Session again to continue.`,
        redirectUrl: null
      } as any
    };
    this.bsModalRef = this.modalService.show(RegisterModalComponent, config);
  }

  registerToPurchase() {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Just a second! You need a Lifecoach account to purchase coaching sessions. Joining Lifecoach is free and only takes seconds!`,
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

  // daySelect(event: any) {
  //   if (event.target.value !== 'NULL') {
  //     console.log(event.target.value);
  //     this.subscriptions.add(
  //       this.dataService.getUserNotReservedEvents(this.program.sellerUid, new Date(event.target.value))
  //         .subscribe(next => {
  //         this.todayEvents = next;
  //       })
  //     );
  //   } else {
  //   }
  // }

  isSameDay(a: Date, b: Date) {
    return (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate());
  }

  logSessions() {
    // console.log('Free events', this.availableEvents);
  }

  reserveSession($event: any) {
    this.dataService.reserveEvent(this.userId, this.program.sellerUid, $event.target.value).then( r => console.log('Reserved'));
    this.showNotification();
  }
  showNotification() {
    this.toastrService.success('<span data-notify="icon" class="tim-icons icon-bell-55"></span>You have 15 minutes for confirm Your reservation. Click here to redirect lifecoach.io/reserved.sessions',
      `You have successfully reserved event`,
      {
        timeOut: 8000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      }, )
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigate(['/reserved-sessions']));
  }

  calcDiscount() {
    if (!this.program.fullPrice) {
      return 0;
    }
    if (!this.program.numSessions) {
      return 0;
    }
    if (!this.program.pricePerSession) {
      return 0;
    }
    if ((this.program.numSessions * this.program.pricePerSession) <= this.program.fullPrice) {
      return 0;
    }
    return (100 - (this.program.fullPrice / (this.program.numSessions * this.program.pricePerSession)) * 100).toFixed();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('program-page');
  }

}
