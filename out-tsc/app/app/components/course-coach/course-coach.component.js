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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CourseReviewsService } from 'app/services/course-reviews.service';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from 'app/services/data.service';
let CourseCoachComponent = class CourseCoachComponent {
    constructor(platformId, transferState, courseReviewsService, dataService) {
        this.platformId = platformId;
        this.transferState = transferState;
        this.courseReviewsService = courseReviewsService;
        this.dataService = dataService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
    }
    ngOnChanges() {
        if (this.course) {
            // console.log(this.course);
            this.fetchReviewsData();
            this.fetchSellerEnrollmentsData();
            this.fetchSellerCoursesData();
            this.fetchCoachPhotoFromProfile();
        }
    }
    fetchReviewsData() {
        const REVIEWS_KEY = makeStateKey('reviews'); // create a key for saving/retrieving state
        const reviewsData = this.transferState.get(REVIEWS_KEY, null); // checking if data in the storage exists
        if (reviewsData === null) { // if state data does not exist - retrieve it from the api
            this.userReviews = this.courseReviewsService.getSellerCourseReviews(this.course.sellerUid);
            // calc avg rating for this user
            this.avgRating = this.userReviews.pipe(map(arr => {
                const ratings = arr.map(v => v.starValue);
                return ratings.length ? ratings.reduce((total, val) => total + val) / arr.length : 'No reviews yet';
            }));
            if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
                this.subscriptions.add(this.userReviews.subscribe(data => {
                    if (data) {
                        this.transferState.set(REVIEWS_KEY, data);
                    }
                }));
            }
        }
        else { // if reviews state data exists retrieve it from the state storage
            this.userReviews = reviewsData;
            console.log('Reviews data for user:', reviewsData);
            this.transferState.remove(REVIEWS_KEY);
        }
    }
    fetchSellerEnrollmentsData() {
        const ENROLLMENTS_KEY = makeStateKey('enrollments'); // create a key for saving/retrieving state
        const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null); // checking if data in the storage exists
        if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
            this.sellerEnrollments = this.dataService.getTotalPublicEnrollmentsByCourseSeller(this.course.sellerUid);
            if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
                this.subscriptions.add(this.sellerEnrollments.subscribe(data => {
                    if (data) {
                        this.transferState.set(ENROLLMENTS_KEY, data);
                    }
                }));
            }
        }
        else { // if state data exists retrieve it from the state storage
            this.sellerEnrollments = enrollmentsData;
            this.transferState.remove(ENROLLMENTS_KEY);
        }
    }
    fetchSellerCoursesData() {
        const COURSES_KEY = makeStateKey('courses'); // create a key for saving/retrieving state
        const coursesData = this.transferState.get(COURSES_KEY, null); // checking if data in the storage exists
        if (coursesData === null) { // if state data does not exist - retrieve it from the api
            this.sellerCourses = this.dataService.getPublicCoursesBySeller(this.course.sellerUid);
            if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
                this.subscriptions.add(this.sellerCourses.subscribe(data => {
                    if (data) {
                        this.transferState.set(COURSES_KEY, data);
                    }
                }));
            }
        }
        else { // if state data exists retrieve it from the state storage
            this.sellerCourses = coursesData;
            this.transferState.remove(COURSES_KEY);
        }
    }
    fetchCoachPhotoFromProfile() {
        if (this.previewAsStudent && !this.course.coachPhoto && !this.sellerImage) { // if course creator is previewing as a student and photo has not yet been added to the course
            // fetch seller's profile image
            const tempSub = this.dataService.getCoachProfile(this.course.sellerUid).subscribe(profile => {
                console.log(profile);
                if (profile) {
                    this.sellerImage = profile.photo;
                }
                tempSub.unsubscribe();
            });
            this.subscriptions.add(tempSub);
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], CourseCoachComponent.prototype, "previewAsStudent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseCoachComponent.prototype, "course", void 0);
CourseCoachComponent = __decorate([
    Component({
        selector: 'app-course-coach',
        templateUrl: './course-coach.component.html',
        styleUrls: ['./course-coach.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, TransferState,
        CourseReviewsService,
        DataService])
], CourseCoachComponent);
export { CourseCoachComponent };
//# sourceMappingURL=course-coach.component.js.map