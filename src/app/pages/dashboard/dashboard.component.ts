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
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AlertService } from 'app/services/alert.service';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { PartnerTrackingService } from 'app/services/partner-tracking.service';
import { CheckoutSessionRequest } from 'app/interfaces/checkout.session.request.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private stripe = Stripe(`${environment.stripeJsClientKey}`);

  public uid: string;
  private claimsUpdated: boolean;
  public userType: 'coach' | 'regular' | 'partner' | 'provider' | 'admin';
  public userAccount: UserAccount;
  public userFirstName = '';
  public chosenPlan: 'trial' | 'spark' | 'flame' | 'blaze';
  public subscriptionPlan: string; // if subscribed to a plan (active or trialing). Note: comes from custom auth calims!
  private partnerTrackingCode: string | null; // will hold a partner tracking code if a promotional partner referred the user anywhere on the app within the last 30 days
  public userSubscriptions: any[]; // Stripe.Subscription[]
  public subscribing: boolean;
  public redirectingToPortal: boolean;
  public products = {} as any;
  public productsLoaded: boolean;
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
  public clients = [] as any[];
  public leads = [] as any[];
  public shareProfile: CoachProfile;

  public feedbackUrl = 'https://lifecoach.nolt.io';

  private subscriptions: Subscription = new Subscription();

  public objKeys = Object.keys;

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
    private cloudFunctionsService: CloudFunctionsService,
    private alertService: AlertService,
    private partnerTrackingService: PartnerTrackingService,
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
      this.loadUserData();
      this.checkStoredPartnerTrackingCode();
    }
  }

  async loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser()
      .subscribe(user => {
        if (user) {
          // User is authorised
          // console.log(`User ${user.uid} is authorised`);
          this.uid = user.uid;

          // Get a SSO token for this user
          this.getUserSSOToken();

          // load the user's custom claims
          this.loadClaims(user);
        }
      })
    );
  }

  async loadClaims(user: firebase.User) {
    const result = await user.getIdTokenResult();
    const c = result.claims;
    if (c.admin || c.coach || c.regular || c.partner || c.provider) {
      // claims now updated. Proceed with load...
      this.claimsUpdated = true;
      console.log('User claims updated!:', c);
      if (c.admin) {
        this.userType = 'admin';
        this.loadAdminData();
      } else if (c.coach) {
        this.userType = 'coach';
        if (c.subscriptionPlan) {
          this.subscriptionPlan = c.subscriptionPlan;
          console.log('Subscription plan:', this.subscriptionPlan);
        } else {
          this.loadProducts();
        }
        this.loadUserAccount();
        this.loadUserSubscriptions();
        this.loadTodos();
        // this.loadClients();
        this.loadCoachProfile();
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
    }

    // loop through checking claims until a valid user type is found
    // because changes to custom claims do not trigger subscription and may take time to propagate...

    const timer = ms => new Promise(res => setTimeout(res, ms));

    while (!this.claimsUpdated) {
      console.log('Looping claims...');
      await timer(2000);
      const newResult = await user.getIdTokenResult(true);
      const n = newResult.claims;
      if (n.admin || n.coach || n.regular || n.partner || n.provider) {
        this.claimsUpdated = true;
        if (n.admin) {
          this.userType = 'admin';
          this.loadAdminData();
        } else if (n.coach) {
          this.userType = 'coach';
          if (n.subscriptionPlan) {
            this.subscriptionPlan = n.subscriptionPlan;
            console.log('Subscription plan:', this.subscriptionPlan);
          } else {
            this.loadProducts();
          }
          this.loadUserAccount();
          this.loadUserSubscriptions();
          this.loadTodos();
          // this.loadClients();
          this.loadCoachProfile();
        } else if (n.regular) {
          this.userType = 'regular';
        } else if (n.partner) {
          this.userType = 'partner';
          this.loadTodos();
        } else if (n.provider) {
          this.userType = 'provider';
        } else {
          this.userType = null;
        }
      }
    }
  }

  loadUserAccount() {
    this.subscriptions.add(
      this.dataService.getUserAccount(this.uid).subscribe(data => {
        if (data) {
          console.log('User account:', data);
          if (data.stripeCustomerId) {
            this.userAccount = data;
          }
          if (data.plan) {
            this.chosenPlan = data.plan;
          }
          if (data.firstName) {
            this.userFirstName = data.firstName;
          }
        }
      })
    );
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

  loadProducts() {
    this.subscriptions.add(
      this.dataService.getProducts().subscribe(data => {
        if (data) {
          const products = {};
          data.forEach(i => {
            products[i.id] = i;
            this.subscriptions.add(
              this.dataService.getPrices(i.id).subscribe(prices => {
                if (prices) {
                  products[i.id].prices = [];
                  prices.forEach(price => {
                    products[i.id].prices.push(price);
                  });
                  this.products = products;
                  console.log('Billing Products:', this.products);
                  this.productsLoaded = true;
                }
              })
            );
          });
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
          console.log('Todos:', this.todos);
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

  loadCoachProfile() {
    this.subscriptions.add(
      this.dataService.getCoachProfile(this.uid).subscribe(profile => {
        if (profile) {
          this.shareProfile = profile;
        }
      })
    );
  }

  arrayContains(array: any[], property: string, value: any) {
    if (!array) {
      return null;
    }
    if (array.some(e => e[property] === value)) {
      /* array contains the element we're looking for */
      return true;
    }
    return null;
  }

  async redirectToStripeCheckout() {
    this.subscribing = true;
    let productId: string;
    Object.keys(this.products).forEach(key => {
      if (this.products[key].role === this.chosenPlan) {
        productId = key;
      }
    });
    if (!productId) {
      this.alertService.alert('warning-message', 'Oops!', 'Missing product ID. Please contact support.');
      return;
    }
    const product = this.products[productId];
    this.analyticsService.attemptCoachSubscription(product.id);
    const data: CheckoutSessionRequest = {
      product,
      uid: this.uid,
      successUrl: `${environment.baseUrl}/dashboard`,
      cancelUrl: `${environment.baseUrl}/dashboard`,
      partnerReferred: this.partnerTrackingCode ? this.partnerTrackingCode : null,
      saleItemType: 'coach_subscription'
    };
    console.log('creating checkout session with data:', data);
    const res = await this.cloudFunctions.createStripeCheckoutSession(data) as any; // should return a session id string
    // console.log('result', res);
    if (res.error) {
      console.error(res.error);
      this.analyticsService.failCoachSubscription(product.id);
      return null;
    }
    const res1 = await this.stripe.redirectToCheckout({
      sessionId: res.sessionId
    });
    if (res1.error) {
      console.error(res1.error);
      this.subscribing = false;
      this.analyticsService.failCoachSubscription(product.id);
      return null;
    }
    // success!
    this.subscribing = false;
    this.analyticsService.completeCoachSubscription(product.id);
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

  async onManageBilling() {
    this.redirectingToPortal = true;
    if (!this.userAccount.stripeCustomerId) {
      console.log('Missing Stripe customer ID');
      this.redirectingToPortal = false;
    }
    // create a portal session
    const data = {
      customerId: this.userAccount.stripeCustomerId,
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

  clickEvent(buttonId: string) {
    this.analyticsService.clickButton(buttonId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
