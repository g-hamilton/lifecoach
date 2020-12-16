import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';


import { TabsetComponent } from 'ngx-bootstrap';

import { MustMatch } from '../../custom-validators/mustmatch.validator';

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
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-account',
  templateUrl: 'account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs', {static: false}) staticTabs: TabsetComponent;
  @ViewChild('refundModal', {static: false}) public refundModal: ModalDirective;

  public browser: boolean;

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

  private accountSnapshot: UserAccount;

  public connectingStripe: boolean;
  public stripeConnectUrl: string;
  public managingStripe: boolean;

  public successfulPayments: any[];
  public failedPayments: any;

  public refunding: boolean;
  public refundPaymentIntent: any; // will be a Stripe.paymentIntent
  public refundForm: FormGroup;
  public focus7: boolean;
  public focus7Touched: boolean;
  public refunds: any[];
  public refundIds: string[];

  public currencies: any;

  public countryList = this.countryService.getCountryList();

  public sessionDurationForm: FormGroup;
  public sessionDurationLength: number;
  public breakBeforeNextSessionLength: number;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
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
    console.log('ENVIRONMENT IS', environment);
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();

      // Build the forms
      this.buildAccountForm();
      this.buildChangeEmailForm();
      this.buildChangePasswordForm();
      this.buildRefundForm();

      this.buildSessionDurationForm();
      // Import currencies
      this.currencies = this.currenciesService.getCurrencies();

      // Update the form with saved user data
      this.subscriptions.add(
        this.authService.getAuthUser()
          .subscribe(user => {
            if (user) {
              this.userId = user.uid;
              // Checking active events
              this.dataService.hasUserEvents(this.userId)
                .then( val => {
                  this.hasUserEvents = val;
                  console.log(this.hasUserEvents);
                })
                .catch(e => console.log(e));

              this.subscriptions.add(
                this.dataService.getUserAccount(user.uid)
                  .subscribe(account => {
                    if (account) {
                      this.accountSnapshot = JSON.parse(JSON.stringify(account));
                      this.updateAccountForm(account);

                      if (account.accountType === 'regular') { // user is a regular user
                        // Fetch payment history
                        this.subscriptions.add(
                          this.dataService.getSuccessfulPayments(this.userId).subscribe(sp => {
                            if (sp) {
                              // tslint:disable-next-line: max-line-length
                              const sortedSp = sp.sort((a, b) => parseFloat(b.created) - parseFloat(a.created)); // sort by date (desc)
                              this.successfulPayments = sortedSp;
                              console.log('Successful payments:', this.successfulPayments);
                            }
                          })
                        );

                        // Fetch failed payment history
                        this.subscriptions.add(
                          this.dataService.getFailedPayments(this.userId).subscribe(fp => {
                            if (fp) {
                              // tslint:disable-next-line: max-line-length
                              const sortedFp = fp.sort((a, b) => parseFloat(b.created) - parseFloat(a.created)); // sort by date (desc)
                              this.failedPayments = sortedFp;
                              console.log('Failed payments:', this.failedPayments);
                            }
                          })
                        );

                        // Fetch refunds
                        this.subscriptions.add(
                          this.dataService.getUserRefunds(this.userId).subscribe(refunds => {
                            if (refunds) {
                              // tslint:disable-next-line: max-line-length
                              const sortedR = refunds.sort((a, b) => parseFloat(b.created) - parseFloat(a.created)); // sort by date (desc)
                              this.refunds = sortedR;
                              console.log('Refunds:', this.refunds);
                              // Build an array of ids for any refunds currently requested
                              this.refundIds = [];
                              refunds.forEach(r => {
                                this.refundIds.push(r.id);
                              });
                            }
                          })
                        );
                      } else if (account.accountType === 'coach' ) { // user is a coach
                        if (!account.stripeUid) { // user has not yet connected Stripe

                          // If redirecting to this component from Stripe, complete connection
                          this.checkStripeOAuth();

                          this.buildStripeUrl(); // create an oauth link to connect Stripe

                          // If we've got the user data, append it to the Stripe url for better UX through the onboarding flow
                          if (account.accountEmail && this.stripeConnectUrl) {
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[email]=${account.accountEmail}`);
                          }
                          if (account.firstName) {
                            // tslint:disable-next-line: max-line-length
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[first_name]=${account.firstName}`);
                          }
                          if (account.lastName) {
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[last_name]=${account.lastName}`);
                          }

                          // Subscribe to profile and add any additional user data
                          // See: https://stripe.com/docs/connect/oauth-reference
                          const tempProfSub = this.dataService.getCoachProfile(this.userId).subscribe(profile => {
                            if (profile) {
                              if (profile.country) {
                                this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[country]=${profile.country.code}`);
                              }
                              if (profile.profileUrl) {
                                this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[url]=${profile.profileUrl}`);
                              } else {
                                this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[url]=${environment.baseUrl}`);
                              }
                            }
                            tempProfSub.unsubscribe();
                          });
                          this.subscriptions.add(tempProfSub);
                        }
                        if (account.stripeUid) {
                          this.retrieveStripeBalance(account.stripeUid);
                        }
                      } else if (account.accountType === 'publisher' ) { // user is a publisher
                        if (!account.stripeUid) { // user has not yet connected Stripe

                          // If redirecting to this component from Stripe, complete connection
                          this.checkStripeOAuth();

                          this.buildStripeUrl(); // create an oauth link to connect Stripe

                          // If we've got the user data, append it to the Stripe url for better UX through the onboarding flow
                          if (account.accountEmail && this.stripeConnectUrl) {
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[email]=${account.accountEmail}`);
                          }
                          if (account.firstName) {
                            // tslint:disable-next-line: max-line-length
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[first_name]=${account.firstName}`);
                          }
                          if (account.lastName) {
                            this.stripeConnectUrl = this.stripeConnectUrl.concat(`&stripe_user[last_name]=${account.lastName}`);
                          }
                        }
                        if (account.stripeUid) {
                          this.retrieveStripeBalance(account.stripeUid);
                        }
                      }
                    }
                  })
              );
            }
          })
      );
    }
    console.log(this.accountF);

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
      creatorDealsProgram: [false],
      creatorExtendedPromotionsProgram: [false],
      sessionDuration: [ 30 ],
      breakDuration: [0]
    });
  }

  buildChangeEmailForm() {
    this.changeEmailForm = this.formBuilder.group({
      newEmail: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  buildChangePasswordForm() {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, {
      validator: MustMatch('newPassword', 'confirmNewPassword')
    });
  }

  buildRefundForm() {
    this.refundForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  buildSessionDurationForm() {
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
      creatorDealsProgram: account.creatorDealsProgram ? account.creatorDealsProgram : false,
      creatorExtendedPromotionsProgram: account.creatorExtendedPromotionsProgram ? account.creatorExtendedPromotionsProgram : false,
      sessionDuration: account.sessionDuration ? account.sessionDuration : 30,
      breakDuration: account.breakDuration ? account.breakDuration : 0
    });
    // console.log(this.accountForm.value);
  }

  async retrieveStripeBalance(stripeUid: string) {
    const res = await this.cloudFunctionsService.getStripeAccountBalance(stripeUid);
    console.log(res);
  }

  checkStripeOAuth() { // NB: Don't call until we have a user id
    // Check active URL
    if (this.router.url.includes('stripe/oauth')) { // incoming redirect from Stripe must be handled
      this.connectingStripe = true;
      this.alertService.alert('info-message', 'Connecting Stripe...', `Important: After clicking OK, please don't refresh or navigate away from this page until you see another success message. Finalising your account may take up to a minute.`);

      // check active route params for Stripe redirect data
      this.route.queryParamMap.subscribe(async params => {
        if (params) {
          const orderObj = {...params.keys, ...params} as any;
          const routeParams = orderObj.params;

          if (!routeParams.state) { // oops, oauth redirect from Stripe with no state data
            this.alertService.closeOpenAlert();
            this.alertService.alert('warning-message', 'Unauthorised!', 'Unable To Complete Stripe Setup. Error: No Stripe state.');
            this.connectingStripe = false;
            return;
          }
          const savedState = localStorage.getItem('stripeState');
          if (!savedState) { // oops, no saved state exists so we can't compare with the data from Stripe
            this.alertService.closeOpenAlert();
            this.alertService.alert('warning-message', 'Oops!', 'Unable To Complete Stripe Setup. Error: No saved Stripe state.');
            this.connectingStripe = false;
            return;
          }
          if (savedState !== routeParams.state) { // oops, saved state does not match redirect state from Stripe
            this.alertService.closeOpenAlert();
            this.alertService.alert('warning-message', 'Unauthorised!', 'Unable To Complete Stripe Setup. Error: Stripe state mismatch.');
            this.connectingStripe = false;
            return;
          }
          if (!routeParams.code) { // oops, no auth code from Stripe. Unable to continue oauth flow
            this.alertService.closeOpenAlert();
            this.alertService.alert('warning-message', 'Oops!', 'Unable To Complete Stripe Setup. Error: No Stripe code received.');
            this.connectingStripe = false;
            return;
          }

          // If we got this far we have a successful redirect from Stripe oauth with matching state data
          // so it's time to complete the Stripe account connection process
          const res = await this.cloudFunctionsService.completeStripeConnection(this.userId, routeParams.code) as any;
          if (!res.error) { // success
            console.log('Stripe connect setup complete', res);
            this.analyticsService.completeStripeConnect();
            this.dataService.completeUserTask(this.userId, 'taskDefault004'); // mark user task complete
            this.connectingStripe = false;
            this.staticTabs.tabs[1].active = true; // auto navigate to Stripe related account tab
            this.alertService.closeOpenAlert();
            this.alertService.alert('success-message', 'Success!', 'Stripe setup complete. You can now receive payments from Lifecoach into your connected Stripe account.');
          } else { // error
            console.error(res.error);
            this.connectingStripe = false;
            this.alertService.closeOpenAlert();
            this.alertService.alert('warning-message', 'Oops', `Something went wrong. Please contact support quoting error: ${JSON.stringify(res.error)}`);
          }
        }
      });
    }
  }

  buildStripeUrl() {
    // See: https://stripe.com/docs/connect/oauth-reference
    const stripeState = this.createStripeState();
    const base = `https://connect.stripe.com/express/oauth/authorize?`;
    const redirect = `${environment.stripeRedirectUri}`;
    const clientId = `${environment.stripeClientId}`;
    const state = `&state=${stripeState}`;
    const userType = `&stripe_user[business_type]=individual`;
    const cap = `&suggested_capabilities[]=transfers`;
    const url = `${base}${redirect}${clientId}${state}${userType}${cap}`;
    this.stripeConnectUrl = url;
  }

  createStripeState() {
    // To protect against CSRF attacks.
    // Create a random string value to send to Stripe on connected account creation.
    const state = Math.random().toString(36).substr(2, 9);
    // Save to local storage so we can compare with the state we get back from Stripe.
    localStorage.setItem('stripeState', state);
    // Return
    return state;
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

  get emailF(): any {
    return this.changeEmailForm.controls;
  }

  get passwordF(): any {
    return this.changePasswordForm.controls;
  }

  get refundF(): any {
    return this.refundForm.controls;
  }

  onCreatorDealsToggle(ev: any) {
    this.accountForm.patchValue({creatorDealsProgram: ev.currentValue});
  }

  onCreatorExtendedPromotionsToggle(ev: any) {
    this.accountForm.patchValue({creatorExtendedPromotionsProgram: ev.currentValue});
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

  onChangeEmail() {
    this.changeEmail = true;
  }

  onChangePassword() {
    this.changePassword = true;
  }

  cancelChangeEmail() {
    this.changeEmail = false;
    this.changeEmailForm.reset();
  }

  async saveNewEmail() {
    if (this.changeEmailForm.valid) {
      this.emailSubmitted = true;
      const oldE = this.accountF.accountEmail.value;
      const oldP = this.emailF.confirmPassword.value;
      const newE = this.emailF.newEmail.value;
      const res = await this.authService.updateAuthEmail(oldE, oldP, newE);
      if (res.result === 'success') {
        console.log('Email update successful. Updating DB...');
        // Update the db node
        await this.dataService.updateUserAccount(this.userId, {
          accountEmail: newE
        });
        this.emailSubmitted = false;
        this.alertService.alert('success-message', 'Success!', 'Login email address updated.');
        this.changeEmail = false;
        // Update mailing list
        console.log('Updating mailing list with new email...');
        this.cloudFunctionsService.updateUserEmailOnMailingList(this.accountF.accountType.value, oldE, newE);
        this.changeEmailForm.reset();
        this.analyticsService.updateAccountEmail();
        this.analyticsService.updatePeopleEmail(newE);
      } else {
        this.emailSubmitted = false;
        this.alertService.alert('warning-message', 'Oops', res.msg);
      }
    }
  }

  cancelChangePassword() {
    this.changePassword = false;
    this.changePasswordForm.reset();
  }

  async saveNewPassword() {
    if (this.changePasswordForm.valid) {
      this.passwordSubmitted = true;
      const email = this.accountF.accountEmail.value;
      const cP = this.passwordF.currentPassword.value;
      const nP = this.passwordF.confirmNewPassword.value;
      const res = await this.authService.updateAuthPassword(email, cP, nP);
      if (res.result === 'success') {
        this.passwordSubmitted = false;
        this.alertService.alert('success-message', 'Success!', 'Your password has been updated.');
        this.changePassword = false;
        this.changePasswordForm.reset();
        this.analyticsService.updateAccountPassword();
      } else {
        this.passwordSubmitted = false;
        this.alertService.alert('warning-message', 'Oops', res.msg);
      }
    }
  }

  async deleteAccount() {
    const res = await this.alertService.alert('special-delete-account') as any;
    if (res.data) {
      this.submitted = true;
      const account: UserAccount = {
        accountEmail: res.data.email,
        password: res.data.password,
        accountType: this.accountF.accountType.value
      };
      // Must attempt sign in first as deleting auth account is a 'sensitive operation'.
      const response = await this.authService.signInWithEmailAndPassword(account);
      if (response.result) {
        // Proceed with delete.
        await this.cloudFunctionsService.deleteUserData(this.userId, account);
        const authResponse = await this.authService.deleteAuthAccount(account);
        if (authResponse.result === 'success') {
          this.router.navigate(['/']);
          this.alertService.alert('success-message', 'Success!', `Your account has been deleted. We're
                    sorry to see you go.`);
          this.analyticsService.deleteAccount();
        } else {
          console.log(authResponse.msg);
        }
        this.submitted = false;
      } else {
        this.alertService.alert('warning-message', 'Oops', `Looks like you entered the wrong
                details. Please check your login email and password then try again.`);
        this.submitted = false;
      }
    }

  }

  connectStripe() {
    if (!this.connectingStripe) {
      this.connectingStripe = true;
      this.analyticsService.attemptStripeConnect();
    }
  }

  loadReceipt(paymentIntentId: string) {
    this.router.navigate(['receipt', paymentIntentId]);
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
    if (this.refundIds && this.refundIds.includes(this.refundPaymentIntent.id)) {
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
