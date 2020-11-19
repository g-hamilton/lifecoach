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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
let EditCourseLecturesComponent = class EditCourseLecturesComponent {
    constructor(platformId, authService, dataService, router, route) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.router = router;
        this.route = route;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            if (this.router.url.includes('new-course')) {
                this.isNewCourse = true;
            }
            if (this.router.url.includes('section') && this.router.url.includes('new')) {
                this.isNewSection = true;
            }
            if (this.router.url.includes('lecture') && this.router.url.includes('new')) {
                this.isNewLecture = true;
            }
            this.loadUserData();
        }
    }
    getRouteData() {
        this.route.params.subscribe(params => {
            if (params.courseId) {
                this.activeRouteCourseId = params.courseId;
                this.loadCourse();
            }
            if (params.sectionId) {
                this.activeRouteSectionId = params.sectionId;
            }
            if (params.lectureId) {
                this.activeRouteLectureId = params.lectureId;
            }
        });
    }
    loadUserData() {
        this.route.queryParams.subscribe(qP => {
            if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
                this.userId = qP.targetUser;
                this.getRouteData();
                this.subscriptions.add(this.dataService.getUserAccount(this.userId).subscribe(account => {
                    if (account) {
                        this.account = account;
                    }
                }));
            }
            else { // User editing their own course
                this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
                    if (user) {
                        this.userId = user.uid;
                        this.getRouteData();
                        this.subscriptions.add(this.dataService.getUserAccount(this.userId).subscribe(account => {
                            if (account) {
                                this.account = account;
                            }
                        }));
                    }
                }));
            }
        });
    }
    loadCourse() {
        if (this.userId && this.activeRouteCourseId) {
            // subscribe to course data
            this.subscriptions.add(this.dataService.getPrivateCourse(this.userId, this.activeRouteCourseId).subscribe(course => {
                if (course) { // course exists
                    this.course = course;
                    // console.log('Course loaded:', this.course);
                }
                else {
                    console.log(`Course with id ${this.activeRouteCourseId} does not exist!`);
                }
            }));
            // subscribe to course review status
            this.subscriptions.add(this.dataService.getCourseReviewRequest(this.activeRouteCourseId).subscribe(data => {
                if (data) {
                    this.reviewRequest = data;
                }
            }));
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
EditCourseLecturesComponent = __decorate([
    Component({
        selector: 'app-edit-course-lectures',
        templateUrl: 'edit.course.lectures.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        Router,
        ActivatedRoute])
], EditCourseLecturesComponent);
export { EditCourseLecturesComponent };
//# sourceMappingURL=edit.course.lectures.component.js.map