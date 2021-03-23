import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from '../../services/search.service';
import { SsoService } from 'app/services/sso.service';

import { UserTask } from '../../interfaces/user.tasks.interface';
import { Subscription } from 'rxjs';
import {CloudFunctionsService} from '../../services/cloud-functions.service';
import { SearchCoachesRequest } from 'app/interfaces/search.coaches.request.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private uid: string;
  public userType: 'coach' | 'regular' | 'partner' | 'provider' | 'admin';

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
    private router: Router
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
          user.getIdTokenResult()
            .then(tokenRes => {
              // console.log('Custom user claims:', tokenRes.claims);
              const c = tokenRes.claims;
              if (c.admin) {
                this.userType = 'admin';
                this.loadAdminData();
              } else if (c.coach) {
                this.userType = 'coach';
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
}
