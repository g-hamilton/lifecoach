import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { TabsetComponent } from 'ngx-bootstrap/tabs';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { AnalyticsService } from '../../services/analytics.service';

import { UserAccount } from '../../interfaces/user.account.interface';
import { CurrenciesService } from 'app/services/currencies.service';
import { CountryService } from 'app/services/country.service';
import { Subscription } from 'rxjs';
import { RefundRequest } from 'app/interfaces/refund.request.interface';
import { environment } from '../../../environments/environment';
import { Stripe } from 'stripe';
import { AccountClosureRequest } from 'app/interfaces/account.closure.request.interface';
import { CompleteStripeConnectRequest } from 'app/interfaces/complete.stripe.connect.request.interface';

@Component({
  selector: 'app-account',
  templateUrl: 'account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('staticTabs', {static: false}) staticTabs: TabsetComponent;
  @ViewChild('refundModal', {static: false}) public refundModal: ModalDirective;

  public browser: boolean;
  public subscriptionPlan: string; // is the user on a stripe subscription plan?
  private userId: string;

  // variable for checking user`s calendar events. Could be deleting in future
  public hasUserEvents: boolean;

  public accountForm: FormGroup;
  public submitted = false;
  public focus: boolean;
  public focus1: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;

  public changeEmailForm: FormGroup;
  public emailSubmitted = false;
  public focus2: boolean;
  public focus3: boolean;
  public focus2Touched: boolean;
  public focus3Touched: boolean;

  public changePasswordForm: FormGroup;
  public passwordSubmitted = false;
  public focus4: boolean;
  public focus5: boolean;
  public focus6: boolean;
  public focus4Touched: boolean;
  public focus5Touched: boolean;
  public focus6Touched: boolean;

  public changeEmail = false;
  public changePassword = false;

  public accountSnapshot: UserAccount;

  public connectingStripe: boolean;
  public stripeConnectUrl: string;
  public managingStripe: boolean;
  public stripeCustomerId: string;
  public redirectingToPortal: boolean;
  public billingSubscriptions = [];

  public successfulPayments: any[];
  public failedPayments: any;

  public refunding: boolean;
  public refundPaymentIntent: Stripe.PaymentIntent;
  public refundForm: FormGroup;
  public focus7: boolean;
  public focus7Touched: boolean;
  public refundRequests: RefundRequest[];
  public successfulRefunds: RefundRequest[];
  public refundsRequestedIds = []; // will contain string ids of any payment intents where a refund has already been requested

  public currencies: any;

  public countryList = this.countryService.getCountryList();

  public sessionDurationForm: FormGroup;
  public sessionDurationLength: number;
  public breakBeforeNextSessionLength: number;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    public formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private cloudFunctionsService: CloudFunctionsService,
    private analyticsService: AnalyticsService,
    private currenciesService: CurrenciesService,
    private countryService: CountryService
  ) {
  }

  ngOnInit() {
    // console.log('ENVIRONMENT IS', environment);
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();
      this.buildAccountForm();
      this.buildRefundForm();
      this.currencies = this.currenciesService.getCurrencies();
      this.loadUserData();
    }

  }

  ngAfterViewInit() {
    this.checkRoute();
  }

  checkRoute() {
    // check the active route url and open relevant tabs if appropriate
    // using timeouts to avoid changedAfterChecked errors
    // staticTabs is the ngx-bootstrap tabs component
    // tab index 0 is the default ('Account Settings' tab)
    if (this.router.url.includes('/billing')) {
      setTimeout(() => {
        this.staticTabs.tabs[1].active = true;
      }, 10);
    } else if (this.router.url.includes('/payments')) {
      setTimeout(() => {
        this.staticTabs.tabs[2].active = true;
      }, 10);
    } else if (this.router.url.includes('/charges')) {
      setTimeout(() => {
        this.staticTabs.tabs[3].active = true;
      }, 10);
    }
  }

  buildAccountForm() {
    this.accountForm = this.formBuilder.group({
      dateCreated: [''],
      accountType: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      accountEmail: new FormControl({value: '', disabled: true}),
      stripeUid: [null],
      stripeRequirementsCurrentlyDue: [null],
      stripeCustomerId: [null],
      stripeCustomerLink: [null],
      sessionDuration: [ 30 ],
      breakDuration: [0]
    });
  }

  buildRefundForm() {
    this.refundForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            // Check custom auth claims
            user.getIdTokenResult(true)
            .then(tokenRes => {
              console.log('User claims:', tokenRes.claims);
              const c = tokenRes.claims;
              if (c.subscriptionPlan) {
                this.subscriptionPlan = c.subscriptionPlan;
              }
            });
            // Checking active events
            // this.dataService.hasUserEvents(this.userId)
            //   .then( val => {
            //     this.hasUserEvents = val;
            //     // console.log(this.hasUserEvents);
            //   })
            //   .catch(e => console.log(e));

            this.subscriptions.add(
              this.dataService.getUserAccount(user.uid)
                .subscribe(account => {
                  if (account) {
                    this.accountSnapshot = JSON.parse(JSON.stringify(account));
                    this.updateAccountForm(account);

                    if (account.accountType === 'regular') {
                      this.fetchSuccessfulCharges();
                      this.fetchFailedCharges();
                      this.fetchRefundRequests();
                      this.fetchSuccessfulRefunds();

                    } else if (account.accountType === 'coach' ) {
                      if (account.stripeCustomerId) { // user has a stripe CUSTOMER id
                        this.stripeCustomerId = account.stripeCustomerId;
                      }
                      // if (!account.stripeUid) { // user has not yet connected Stripe

                      //   this.buildStripeUrl(); // create an oauth link to connect Stripe

                      //   // If we've got the user data, append it to the Stripe url for better UX through the onboarding flow
                      //   if (account.accountEmail && this.stripeConnectUrl) {
                      //     this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[email]=${account.accountEmail}`);
                      //   }
                      //   if (account.firstName) {
                      //     // tslint:disable-next-line: max-line-length
                      //     this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[first_name]=${account.firstName}`);
                      //   }
                      //   if (account.lastName) {
                      //     this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[last_name]=${account.lastName}`);
                      //   }

                      //   // Subscribe to profile and add any additional user data
                      //   // See: https://stripe.com/docs/connect/oauth-reference
                      //   const tempProfSub = this.dataService.getCoachProfile(this.userId).subscribe(profile => {
                      //     if (profile) {
                      //       if (profile.country) {
                      //         this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[country]=${profile.country.code}`);
                      //       }
                      //       if (profile.profileUrl) {
                      //         this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[url]=${profile.profileUrl}`);
                      //       } else {
                      //         this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[url]=${environment.baseUrl}`);
                      //       }
                      //     }
                      //     tempProfSub.unsubscribe();
                      //   });
                      //   this.subscriptions.add(tempProfSub);
                      // }
                      this.fetchSuccessfulCharges();
                      this.fetchFailedCharges();
                      this.fetchRefundRequests();
                      this.fetchSuccessfulRefunds();
                      this.fetchSubscriptions();

                    } else if (account.accountType === 'partner' ) {
                      // anything?
                    }
                  }
                })
            );
          }
        })
    );
  }

  updateAccountForm(account: UserAccount) {
    this.accountForm.patchValue({
      dateCreated: account.dateCreated,
      accountType: account.accountType,
      firstName: account.firstName,
      lastName: account.lastName,
      accountEmail: account.accountEmail,
      stripeUid: account.stripeUid ? account.stripeUid : null,
      stripeRequirementsCurrentlyDue: account.stripeRequirementsCurrentlyDue ? account.stripeRequirementsCurrentlyDue : null,
      stripeCustomerId: account.stripeCustomerId ? account.stripeCustomerId : null,
      stripeCustomerLink: account.stripeCustomerLink ? account.stripeCustomerLink : null,
      sessionDuration: account.sessionDuration ? account.sessionDuration : 30,
      breakDuration: account.breakDuration ? account.breakDuration : 0
    });
    // console.log(this.accountForm.value);
  }

  fetchSuccessfulCharges() {
    this.subscriptions.add(
      this.dataService.getSuccessfulCharges(this.userId).subscribe(sp => {
        if (sp) {
          const sortedSp = sp.sort((a, b) => parseFloat(String(b.created)) - parseFloat(String(a.created))); // sort by date (desc)
          this.successfulPayments = sortedSp;
          console.log('Successful charges:', this.successfulPayments);
        }
      })
    );
  }

  fetchFailedCharges() {
    this.subscriptions.add(
      this.dataService.getFailedPayments(this.userId).subscribe(fp => {
        if (fp) {
          const sortedFp = fp.sort((a, b) => parseFloat(String(b.created)) - parseFloat(String(a.created))); // sort by date (desc)
          this.failedPayments = sortedFp;
          console.log('Failed charges:', this.failedPayments);
        }
      })
    );
  }

  fetchRefundRequests() {
    this.subscriptions.add(
      this.dataService.getUserRefundRequests(this.userId).subscribe(refunds => {
        if (refunds) {
          const sortedR = refunds.sort((a, b) => parseFloat(String(b.paymentIntent.created)) - parseFloat(String(a.paymentIntent.created))); // sort by date (desc)
          this.refundRequests = sortedR;
          console.log('Refund requests:', this.refundRequests);
          this.refundRequests.forEach(i => {
            this.refundsRequestedIds.push(i.paymentIntent.id);
          });
        }
      })
    );
  }

  fetchSuccessfulRefunds() {
    this.subscriptions.add(
      this.dataService.getUserSuccessfulRefunds(this.userId).subscribe(refunds => {
        if (refunds) {
          const sortedR = refunds.sort((a, b) => parseFloat(String(b.paymentIntent.created)) - parseFloat(String(a.paymentIntent.created))); // sort by date (desc)
          this.successfulRefunds = sortedR;
          console.log('Successful refunds:', this.successfulRefunds);
          this.successfulRefunds.forEach(i => {
            this.refundsRequestedIds.push(i.paymentIntent.id);
          });
        }
      })
    );
  }

  fetchSubscriptions() {
    this.subscriptions.add(
      this.dataService.getUserSubscriptions(this.userId).subscribe(data => {
        if (data) {
          this.billingSubscriptions = [];
          data.forEach(i => {
            const subObj = { ...i } as any;
            this.subscriptions.add(
              this.dataService.getUserInvoices(this.userId, i.id).subscribe(invoices => {
                if (invoices) {
                  subObj.invoices = [];
                  invoices.forEach(invoice => {
                    subObj.invoices.push(invoice);
                  });
                }
              })
            );
            this.billingSubscriptions.push(subObj);
          });
          console.log('Billing subscriptions', this.billingSubscriptions);
        }
      })
    );
  }

  async manageStripe() {
    if (isPlatformBrowser(this.platformId)) {
      this.managingStripe = true;
      if (this.accountF.stripeUid.value) {
        const res = await this.cloudFunctionsService.getStripeLoginLink(this.accountF.stripeUid.value) as any;
        // console.log(res);
        if (!res.error) { // success
          // Create a new anchor element and open the Stripe login url in a new tab
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = res.stripeLoginUrl;
          link.setAttribute('visibility', 'hidden');
          link.click();

          // this.document.location.href = res.stripeLoginUrl;

          this.analyticsService.manageStripeConnect();

          this.managingStripe = false;
        } else { // error

        }
      } else { // no stripe uid
        this.managingStripe = false;
      }
    }
  }

  timestampToDate(timestamp: number) {
    // Convert unix timestamp (epoch) to date string
    return new Date(timestamp * 1000).toDateString();
  }

  get accountF(): any {
    return this.accountForm.controls;
  }

  get refundF(): any {
    return this.refundForm.controls;
  }

  onSessionDurationInput(ev: any) {
    console.log(+ev.target.value);
    this.accountForm.patchValue({sessionDuration: +ev.target.value });
  }

  onBreakDurationInput(ev: any) {
    console.log(this.breakBeforeNextSessionLength);
    this.accountForm.patchValue({breakDuration: +ev.target.value });
  }

  async onSubmit() {
    if (this.accountSnapshot.sessionDuration !== this.accountF.sessionDuration.value
      || this.accountSnapshot.breakDuration !== this.accountF.breakDuration.value) {
      // alert('Changed session and breaks'); // Modal
                                            // TODO: Alert user, if they had sessions
      // return;
    }
    console.log(this.accountForm.value);

    if (this.accountForm.valid) {

      this.analyticsService.updateAccount();

      this.submitted = true;

      const aT = this.accountF.accountType.value;
      const eM = this.accountF.accountEmail.value;
      const fN = this.accountF.firstName.value;
      const lN = this.accountF.lastName.value;

      // Only update mailing list if necessary
      if (this.accountSnapshot.firstName !== fN || this.accountSnapshot.lastName !== lN) {
        console.log('Updating mailing list with updated user info');
        this.cloudFunctionsService.updateUserNameOnMailingList(aT, eM, fN, lN);
        this.analyticsService.updatePeopleName(fN, lN);
      }

      console.log('Updating DB - user account');
      await this.dataService.updateUserAccount(this.userId, this.accountForm.value);

      this.submitted = false;
      this.alertService.alert('success-message', 'Success!', 'Your Lifecoach account details have been updated.');

    } else {
      console.log('Account form invalid!');
    }
  }

  async deleteAccount() {
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Are you sure?', `Once your account is deleted you will lose all saved data. This action is permanent & cannot be undone!`, 'Yes - Close My Account', 'Cancel') as any;
    this.submitted = true;
    console.log('Result:', res);
    if (res.action) { // confirmed close
      // create a request for admins to close account on the back end...
      if (!this.userId) {
        this.alertService.alert('warning-message', 'Oops!', 'Missing User ID, please contact support.');
        return;
      }
      const data: AccountClosureRequest = {
        uid: this.userId
      };
      const closeResult = await this.cloudFunctionsService.requestAccountClosure(data) as any;
      console.log('Close result:', closeResult);
      if (closeResult.error) {
        this.alertService.alert('warning-message', 'Oops!', `Error: ${closeResult.error.message}`);
        this.submitted = false;
        return;
      }
      this.submitted = false;
      this.alertService.alert('success-message', 'Success!', `We are processing your closure request. You will now be logged out & your account will be permanently closed. We're sorry to see you go!`);
      this.authService.signOut();
    }
    // action cancelled
    this.submitted = false;
  }

  async connectStripe() {
    if (!this.connectingStripe) {
      this.connectingStripe = true;
      this.analyticsService.attemptStripeConnect();

      // call the back end to create a Stripe STANDARD account & generate an accountLink redirect URL
      // to send the user directly into the Stripe account setup flow...

      const data: CompleteStripeConnectRequest = {
        uid: this.userId,
        returnUrl: `${environment.baseUrl}/account/payments`,
        refreshUrl: `${environment.baseUrl}/account/payments?reauth`,
        type: 'account_onboarding'
      };

      const res = await this.cloudFunctionsService.connectStripe(data) as any;
      if (res.error) { // error!
        this.alertService.alert('warning-message', 'Oops!', `Error: ${res.error}. Please contact support.`);
        return;
      }

      // success
      // we've got the redirect url. Send the user into the flow...
      // they will be redirected back to the app on completion.
      // https://stripe.com/docs/connect/enable-payment-acceptance-guide

      window.location.href = res.url;
      this.connectingStripe = false;
    }
  }

  loadReceipt(chargeId: string) {
    // console.log(chargeId);
    this.router.navigate(['receipt', chargeId]);
  }

  popRefund(paymentIntent: any) {
    this.refundPaymentIntent = paymentIntent;
    console.log('setting refund payment intent', this.refundPaymentIntent);
    this.refundModal.show();
  }

  async requestRefund() {
    this.refunding = true;
    if (!this.refundPaymentIntent) {
      this.alertService.alert('warning-message', 'Oops', 'Error processing refund: missing payment intent.');
      this.refunding = false;
      return;
    }
    if (this.refundForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required information.');
      this.refunding = false;
      return;
    }
    if (this.refundsRequestedIds && this.refundsRequestedIds.includes(this.refundPaymentIntent.id)) {
      this.alertService.alert('warning-message', 'Oops', 'You have already requested a refund for this item.');
      this.refunding = false;
      return;
    }
    const refundRequest: RefundRequest = {
      uid: this.userId,
      paymentIntent: this.refundPaymentIntent,
      formData: this.refundForm.value
    };
    const res = await this.cloudFunctionsService.requestRefund(refundRequest) as any;
    if (res.error) {
      this.refunding = false;
      this.refundModal.hide();
      this.alertService.alert('warning-message', 'Oops', `Error: ${JSON.stringify(res.error)}`);
      return;
    }
    this.refunding = false;
    this.refundModal.hide();
    this.alertService.alert('success-message', 'Success!', `Your refund request has been sent to the support team.
        You can keep an eye on the status of your refund request at the bottom of your purchase history.`);
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  async onManageBilling() {
    this.redirectingToPortal = true;
    if (!this.stripeCustomerId) {
      console.log('Missing Stripe customer ID');
      this.redirectingToPortal = false;
    }
    // create a portal session
    const data = {
      customerId: this.stripeCustomerId,
      returnUrl: `${environment.baseUrl}/account`
    };
    const res = await this.cloudFunctionsService.createStripePortalSession(data) as any;
    if (res.error) {
      console.error(res.error);
      this.redirectingToPortal = false;
      return null;
    }
    // redirect to session url
    window.location.href = res.sessionUrl;
    this.redirectingToPortal = false;
  }

  async logout() {
    this.subscriptions.unsubscribe();
    await this.authService.signOut();
    console.log('Sign out successful.');
    this.alertService.alert('auto-close', 'Sign-Out Successful', 'See you again soon');
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
