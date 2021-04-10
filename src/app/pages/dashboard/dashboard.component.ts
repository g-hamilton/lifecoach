import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';
declare var Stripe: any;

import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from '../../services/search.service';
import { SsoService } from 'app/services/sso.service';

import { UserTask } from '../../interfaces/user.tasks.interface';
import { Subscription } from 'rxjs';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { SearchCoachesRequest } from 'app/interfaces/search.coaches.request.interface';
import { Router } from '@angular/router';
import { CurrenciesService } from 'app/services/currencies.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private stripe = Stripe(`${environment.stripeJsClientKey}`);

  private uid: string;
  public userType: 'coach' | 'regular' | 'partner' | 'provider' | 'admin';
  public stripeCustomerId: string; // coach users may have a stripe customer id if they have previously subscribed
  public subscriptionPlan: string; // if subscribed to a plan (active or trialing), this will be the plan's stripe price id
  public userSubscriptions: any[]; // Stripe.Subscription[]
  public subscribing: boolean;
  public product = {
    priceId: 'price_1IdF2bBulafdcV5tZKdSbed8',
    image: '',
    title: 'Spark',
    price: 24.99,
    currency: 'GBP'
  };
  public clientCurrency: string;
  public clientCountry: string;
  public rates: any;

  public adminCountAllUsers: number;
  public adminCountRegularUsers: number;
  public adminCountCoachUsers: number;
  public adminCountPartnerUsers: number;
  public adminCountProviderUsers: number;
  public adminPublicCoachesCount: number;
  public adminCountAdminUsers: number;
  public adminNewestUsers: any;

  public adminPublishedCoursesCount: number;
  public adminDraftCoursesCount: number;
  public adminCourseReviewRequests: number;
  public adminCourseRefundRequests: number;

  public adminPublishedProgramsCount: number;
  public adminDraftProgramsCount: number;
  public adminProgramReviewRequests: number;
  public adminProgramRefundRequests: number;

  public adminPublishedServicesCount: number;
  public adminDraftServicesCount: number;
  public adminServiceReviewRequests: number;
  public adminServiceRefundRequests: number;

  public adminNewestLeads: any;
  public adminTotalLeads: number;

  public todos: UserTask[];
  public clients: any;

  public feedbackUrl = 'https://lifecoach.nolt.io';

  private subscriptions: Subscription = new Subscription();

  pageToken: string;
  public uniqUsers: Array<any>;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private searchService: SearchService,
    private ssoService: SsoService,
    private cloudFunctions: CloudFunctionsService,
    private router: Router,
    private currenciesService: CurrenciesService,
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
      this.loadUserData();
    }
  }

  async loadUserData() {
    // Get user ID
    const tempAuthSub = this.authService.getAuthUser()
      .subscribe(user => {
        if (user) {
          // User is authorised
          // console.log(`User ${user.uid} is authorised`);
          this.uid = user.uid; // <-- Ensure we get an authorised uid before calling for user data

          // Get a SSO token for this user
          this.getUserSSOToken();

          // Check the user's custom auth claims for user type
          user.getIdTokenResult(true)
            .then(tokenRes => {
              console.log('User claims:', tokenRes.claims);
              const c = tokenRes.claims;
              if (c.admin) {
                this.userType = 'admin';
                this.loadAdminData();
              } else if (c.coach) {
                this.userType = 'coach';
                if (c.subscriptionPlan) {
                  this.subscriptionPlan = c.subscriptionPlan;
                  console.log('Subscription plan:', this.subscriptionPlan);
                }
                this.loadUserAccount();
                this.loadUserSubscriptions();
                this.checkSavedClientCurrency();
                this.monitorPlatformRates();
                this.loadTodos();
                // this.loadClients();
              } else if (c.regular) {
                this.userType = 'regular';
              } else if (c.partner) {
                this.userType = 'partner';
                this.loadTodos();
              } else if (c.provider) {
                this.userType = 'provider';
              } else {
                this.userType = null;
              }
            });
        }
        tempAuthSub.unsubscribe();
      });
    this.subscriptions.add(tempAuthSub);
  }

  loadUserAccount() {
    this.subscriptions.add(
      this.dataService.getUserAccount(this.uid).subscribe(data => {
        if (data) {
          if (data.stripeCustomerId) {
            this.stripeCustomerId = data.stripeCustomerId;
            console.log('Stripe customer ID:', this.stripeCustomerId);
          }
        }
      })
    );
  }

  loadUserSubscriptions() {
    this.subscriptions.add(
      this.dataService.getUserSubscriptions(this.uid).subscribe(data => {
        if (data) {
          this.userSubscriptions = data;
          console.log('User subscriptions:', this.userSubscriptions);
          // check the user's custom auth claims
          const tempAuthSub = this.authService.getAuthUser()
          .subscribe(user => {
            if (user) {
              // Get a SSO token for this user
              // this.getUserSSOToken();

              // Check the user's custom auth claims for user type
              user.getIdTokenResult(true)
                .then(tokenRes => {
                  console.log('Checking user claims:', tokenRes.claims);
                  const c = tokenRes.claims;
                  if (c.subscriptionPlan) {
                    this.subscriptionPlan = c.subscriptionPlan;
                    console.log('Subscription plan:', this.subscriptionPlan);
                  }
                });
            }
            tempAuthSub.unsubscribe();
          });
          this.subscriptions.add(tempAuthSub);
        }
      })
    );
  }

  loadTodos() {
    this.subscriptions.add(
      this.dataService.getUserTasksTodos(this.uid)
        .subscribe(todos => {
          this.todos = todos;
        })
    );
  }

  loadClients() {
    this.clients = [
      {
        id: '000000001',
        firstName: 'Tania',
        lastName: 'Mike',
        jobRole: 'CEO',
        photo: 'assets/img/tania.jpg',
        actions: [
          {
            id: '000000001'
          }
        ]
      }
    ];
  }

  async redirectToStripeCheckout() {
    this.subscribing = true;
    this.analyticsService.attemptCoachSubscription(this.product.priceId);
    const data = {
      product: this.product,
      uid: this.uid,
      successUrl: `${environment.baseUrl}/dashboard`,
      cancelUrl: `${environment.baseUrl}/dashboard`,
      partnerReferred: 'false', // TODO
      saleItemType: 'coach_subscription'
    };
    console.log('creating checkout session with data:', data);
    const res = await this.cloudFunctions.createStripeCheckoutSession(data) as any; // should return a session id string
    // console.log('result', res);
    if (res.error) {
      console.error(res.error);
      this.analyticsService.failCoachSubscription(this.product.priceId);
      return null;
    }
    const res1 = await this.stripe.redirectToCheckout({
      sessionId: res.sessionId
    });
    if (res1.error) {
      console.error(res1.error);
      this.subscribing = false;
      this.analyticsService.failCoachSubscription(this.product.priceId);
      return null;
    }
    // success!
    this.subscribing = false;
    this.analyticsService.completeCoachSubscription(this.product.priceId);
  }

  async loadAdminData() {

    // users

    const request: SearchCoachesRequest = {
      page: 1,
      hitsPerPage: 1
    };
    const publicCoaches = await this.searchService.searchCoaches(request);
    this.adminPublicCoachesCount = publicCoaches.nbHits;

    const allUsers = await this.searchService.searchUsers(10, 1);
    this.adminCountAllUsers = allUsers.nbHits;
    this.adminNewestUsers = allUsers.hits; // no filter required as index is sorted by date created (descending)
    // console.log('NEW', this.adminNewestUsers);

    const regularUsers = await this.searchService.searchUsers(1, 1, {params: {accountType: 'regular'}});
    this.adminCountRegularUsers = regularUsers.nbHits;

    const coachUsers = await this.searchService.searchUsers(1, 1, {params: {accountType: 'coach'}});
    this.adminCountCoachUsers = coachUsers.nbHits;

    const partnerUsers = await this.searchService.searchUsers(1, 1, {params: {accountType: 'partner'}});
    this.adminCountPartnerUsers = partnerUsers.nbHits;

    const providerUsers = await this.searchService.searchUsers(1, 1, {params: {accountType: 'provider'}});
    this.adminCountProviderUsers = providerUsers.nbHits;

    const adminUsers = await this.searchService.searchUsers(1, 1, {params: {accountType: 'admin'}});
    this.adminCountAdminUsers = adminUsers.nbHits;

    // ecourses

    const draftCourses = await this.searchService.searchDraftCourses(1, 1, {});
    this.adminDraftCoursesCount = draftCourses.nbHits;

    const coursesCount = await this.searchService.searchCourses(1, 1, {});
    this.adminPublishedCoursesCount = coursesCount.nbHits;

    this.subscriptions.add(
      this.dataService.getTotalAdminCoursesInReview().subscribe(total => {
        total ? this.adminCourseReviewRequests = total.totalRecords : this.adminCourseReviewRequests = 0;
      })
    );

    const courseRefundRequestCount = await this.searchService.searchCourseRefundRequests(1, 1, {});
    this.adminCourseRefundRequests = courseRefundRequestCount.nbHits;

    // programs

    const draftPrograms = await this.searchService.searchDraftPrograms(1, 1, {});
    this.adminDraftProgramsCount = draftPrograms.nbHits;

    const programsCount = await this.searchService.searchPrograms(1, 1, {});
    this.adminPublishedProgramsCount = programsCount.nbHits;

    this.subscriptions.add(
      this.dataService.getTotalAdminProgramsInReview().subscribe(total => {
        total ? this.adminProgramReviewRequests = total.totalRecords : this.adminProgramReviewRequests = 0;
      })
    );

    const programRefundRequestCount = await this.searchService.searchProgramRefundRequests(1, 1, {});
    this.adminProgramRefundRequests = programRefundRequestCount.nbHits;

    // services

    const draftServices = await this.searchService.searchDraftServices(1, 1, {});
    this.adminDraftServicesCount = draftServices.nbHits;

    const servicesCount = await this.searchService.searchServices(1, 1, {});
    this.adminPublishedServicesCount = servicesCount.nbHits;

    this.subscriptions.add(
      this.dataService.getTotalAdminServicesInReview().subscribe(total => {
        total ? this.adminServiceReviewRequests = total.totalRecords : this.adminServiceReviewRequests = 0;
      })
    );

    const serviceRefundRequestCount = await this.searchService.searchServiceRefundRequests(1, 1, {});
    this.adminServiceRefundRequests = serviceRefundRequestCount.nbHits;

    // leads

    const leads = await this.searchService.searchCoachLeads(10, 1, {});
    this.adminTotalLeads = leads.nbHits;
    this.adminNewestLeads = leads.hits;
  }

  round(num: number) {
    return Math.round(num);
  }

  timestampToDate(timestamp: number) {
    // Convert unix timestamp (epoch) to date string
    return new Date(timestamp * 1000).toDateString();
  }

  async getUserSSOToken() {
    const token = await this.ssoService.getSsoToken(this.uid);
    if (token) {
      this.feedbackUrl = `https://lifecoach.nolt.io/sso/${token}`;
    }
  }

  dismissTodo(taskId) {
    if (!this.uid) {
      return;
    }
    if (!taskId) {
      return;
    }
    this.dataService.completeUserTask(this.uid, taskId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  resizeImage() {
    console.log('Clicked');
    this.cloudFunctions.resizeProfileAvatarsManager({token: this.pageToken})
      .then( resp => {
        console.log('responded');
        console.log(resp);
        this.pageToken = resp.token;
      })
      .catch( e => console.log(e));

  }
  async resizeCoursesImage() {
    try {
      const resp = await this.cloudFunctions.courseImagesManager({token: this.pageToken});
      console.log(resp);

      // @ts-ignore
      this.pageToken = resp.token;
      // const uploadingPromises = resp.info()

    } catch (e) {
      console.log(e);
    }
  }

  viewPublicProfile(uid: string) {
    this.router.navigate(['coach', uid]);
  }

  manageUser(uid: string) {
    this.router.navigate(['admin-manage-user', uid]);
  }

  get displayPrice() {
    if (!this.product.price || !this.rates || !this.product.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.product.currency === this.clientCurrency) { // no conversion needed
      return this.product.price;
    }

    amount = Number((this.product.price / this.rates[this.product.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

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

  checkSavedClientCurrency() {
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

  monitorPlatformRates() {
    // Monitor platform rates for realtime price calculations
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          // console.log('Rates:', rates);
          this.rates = rates;
        }
      })
    );
  }

}
