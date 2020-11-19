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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { Router } from '@angular/router';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let CourseSubmitComponent = class CourseSubmitComponent {
    constructor(platformId, dataService, alertService, router, analyticsService) {
        this.platformId = platformId;
        this.dataService = dataService;
        this.alertService = alertService;
        this.router = router;
        this.analyticsService = analyticsService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }
    ngOnChanges() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.userId && this.course && (!this.course.coachName || !this.course.coachPhoto)) { // if the course has no coach name or photo yet
                this.loadUserProfile();
            }
        }
    }
    loadUserProfile() {
        // perform a background load of the user's public user profile if they have one.
        // course submission should not be allowed until a user has a public profile.
        // when the user has a public profile, add their name and photo to the course object.
        this.loadingProfile = true;
        this.subscriptions.add(this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
            if (profile && profile.firstName && profile.lastName && profile.photo) {
                this.course.coachName = `${profile.firstName} ${profile.lastName}`;
                this.course.coachPhoto = profile.photo;
                console.log('Fetched profile', profile);
            }
            this.loadingProfile = false;
        }));
    }
    getDisplayDate(unix) {
        const date = new Date(unix * 1000);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[date.getDay()];
        return `${day} ${date.toLocaleDateString()}`;
    }
    sectionsMissingLectures() {
        // returns true if any sections are missing lectures, otherwise returns false
        const emptySections = [];
        if (this.course.sections) {
            this.course.sections.forEach((s, index) => {
                if (!s.lectures) {
                    emptySections.push(index);
                }
            });
        }
        if (emptySections.length) {
            this.alertService.alert('warning-message', 'Oops', `All course sections must contain at least 1 lecture and cannot be empty. The following sections are missing lectures: ${emptySections}`);
            return true;
        }
        return false;
    }
    isCourseValid(course) {
        if (!course) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course`);
            return false;
        }
        if (!course.courseId) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course ID`);
            return false;
        }
        if (!course.title) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course title`);
            return false;
        }
        if (!course.pricingStrategy) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: Please save your pricing preferences under the Course Options tab.`);
            return false;
        }
        if (course.pricingStrategy === 'paid' && !course.currency) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course currency`);
            return false;
        }
        if (course.pricingStrategy === 'paid' && !course.price) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course price`);
            return false;
        }
        if (!course.sections) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course sections`);
            return false;
        }
        if (!course.lectures) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course lectures`);
            return false;
        }
        if (!course.sellerUid) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course seller UID`);
            return false;
        }
        if (course.pricingStrategy === 'paid' && !course.stripeId) {
            this.alertService.alert('warning-message', 'Oops', `Course Invalid: Missing course Stripe ID`);
            return false;
        }
        if (!course.coachName) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course public coach name`);
            return false;
        }
        if (!course.coachPhoto) {
            this.alertService.alert('warning-message', 'Oops', `Course invalid: No course public coach photo`);
            return false;
        }
        if (this.sectionsMissingLectures()) {
            return false;
        }
        return true;
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.requesting = true;
            if (this.course.reviewRequest && this.course.reviewRequest.status === 'submitted') {
                this.requesting = false;
                this.alertService.alert('info-message', 'Just a second!', `This course has already been submitted for review.`);
                return;
            }
            if (this.course.reviewRequest && this.course.reviewRequest.status === 'in-review') {
                this.requesting = false;
                this.alertService.alert('info-message', 'Just a second!', `This course is already in review.`);
                return;
            }
            if (this.course.reviewRequest && this.course.reviewRequest.status === 'approved') {
                this.requesting = false;
                this.alertService.alert('info-message', 'Just a second!', `This course is already approved.`);
                return;
            }
            // check if course valid
            if (!this.isCourseValid(this.course)) {
                console.log('Course NOT valid!');
                this.requesting = false;
                return;
            }
            // ***** ADMIN ONLY for testing *****
            // mark course as test
            // run this locally - remember to comment out before releasing!!!
            // this.course.isTest = true;
            // request review
            yield this.dataService.savePrivateCourse(this.course.sellerUid, this.course); // autosave the course now that we've added additional seller profile data
            this.dataService.requestCourseReview(this.course);
            this.dataService.completeUserTask(this.course.sellerUid, 'taskDefault003');
            this.alertService.alert('success-message', 'Success!', 'Your course is now in review!');
            this.requesting = false;
            this.analyticsService.submitCourseForReview();
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseSubmitComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseSubmitComponent.prototype, "course", void 0);
CourseSubmitComponent = __decorate([
    Component({
        selector: 'app-course-submit',
        templateUrl: './course-submit.component.html',
        styleUrls: ['./course-submit.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, DataService,
        AlertService,
        Router,
        AnalyticsService])
], CourseSubmitComponent);
export { CourseSubmitComponent };
//# sourceMappingURL=course-submit.component.js.map