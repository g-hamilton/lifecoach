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

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private stripe = Stripe(`${environment.stripeJsClientKey}`);

  private uid: string;
  public userType: 'coach' | 'regular' | 'partner' | 'provider' | 'admin';
  public userAccount: UserAccount;
  public userFirstName = '';
  public chosenPlan: 'trial' | 'spark' | 'flame' | 'blaze';
  public subscriptionPlan: string; // if subscribed to a plan (active or trialing). Note: comes from custom auth calims!
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
    private alertService: AlertService
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
                } else {
                  this.loadProducts();
                }
                this.loadUserAccount();
                this.loadUserSubscriptions();
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
                  console.log(this.products);
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
    const data = {
      product,
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
