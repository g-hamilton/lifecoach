var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from '../../services/search.service';
import { SsoService } from 'app/services/sso.service';
import { Subscription } from 'rxjs';
let DashboardComponent = class DashboardComponent {
    constructor(platformId, authService, dataService, analyticsService, searchService, ssoService) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.analyticsService = analyticsService;
        this.searchService = searchService;
        this.ssoService = ssoService;
        this.feedbackUrl = 'https://lifecoach.nolt.io';
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
            this.loadUserData();
        }
    }
    loadUserData() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        }
                        else if (c.coach) {
                            this.userType = 'coach';
                            this.loadTodos();
                            // this.loadClients();
                        }
                        else if (c.regular) {
                            this.userType = 'regular';
                        }
                        else if (c.publisher) {
                            this.userType = 'publisher';
                            this.loadTodos();
                        }
                        else if (c.provider) {
                            this.userType = 'provider';
                        }
                        else {
                            this.userType = null;
                        }
                    });
                }
                tempAuthSub.unsubscribe();
            });
            this.subscriptions.add(tempAuthSub);
        });
    }
    loadTodos() {
        this.subscriptions.add(this.dataService.getUserTasksTodos(this.uid)
            .subscribe(todos => {
            this.todos = todos;
        }));
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
    loadAdminData() {
        return __awaiter(this, void 0, void 0, function* () {
            const publicCoaches = yield this.searchService.searchCoaches(1, 1);
            this.adminPublicCoachesCount = publicCoaches.nbHits;
            const allUsers = yield this.searchService.searchUsers(10, 1);
            this.adminCountAllUsers = allUsers.nbHits;
            this.adminNewestUsers = allUsers.hits; // no filter required as index is sorted by date created (descending)
            // console.log('NEW', this.adminNewestUsers);
            const regularUsers = yield this.searchService.searchUsers(1, 1, { params: { accountType: 'regular' } });
            this.adminCountRegularUsers = regularUsers.nbHits;
            const coachUsers = yield this.searchService.searchUsers(1, 1, { params: { accountType: 'coach' } });
            this.adminCountCoachUsers = coachUsers.nbHits;
            const publisherUsers = yield this.searchService.searchUsers(1, 1, { params: { accountType: 'publisher' } });
            this.adminCountPublisherUsers = publisherUsers.nbHits;
            const providerUsers = yield this.searchService.searchUsers(1, 1, { params: { accountType: 'provider' } });
            this.adminCountProviderUsers = providerUsers.nbHits;
            const adminUsers = yield this.searchService.searchUsers(1, 1, { params: { accountType: 'admin' } });
            this.adminCountAdminUsers = adminUsers.nbHits;
            const draftCourses = yield this.searchService.searchDraftCourses(1, 1, {}, false);
            this.adminDraftCoursesCount = draftCourses.nbHits;
            const coursesCount = yield this.searchService.searchCourses(1, 1, {}, false);
            this.adminPublishedCoursesCount = coursesCount.nbHits;
            this.subscriptions.add(this.dataService.getTotalAdminCoursesInReview().subscribe(total => {
                total ? this.adminCourseReviewRequests = total.totalRecords : this.adminCourseReviewRequests = 0;
            }));
            const refundRequestCount = yield this.searchService.searchCourseRefundRequests(1, 1, {});
            this.adminCourseRefundRequests = refundRequestCount.nbHits;
            const leads = yield this.searchService.searchCoachLeads(10, 1, {});
            this.adminTotalLeads = leads.nbHits;
            this.adminNewestLeads = leads.hits;
        });
    }
    round(num) {
        return Math.round(num);
    }
    timestampToDate(timestamp) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }
    getUserSSOToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.ssoService.getSsoToken(this.uid);
            if (token) {
                this.feedbackUrl = `https://lifecoach.nolt.io/sso/${token}`;
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
DashboardComponent = __decorate([
    Component({
        selector: 'app-dashboard',
        templateUrl: 'dashboard.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        AnalyticsService,
        SearchService,
        SsoService])
], DashboardComponent);
export { DashboardComponent };
//# sourceMappingURL=dashboard.component.js.map