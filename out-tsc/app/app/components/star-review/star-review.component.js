var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CourseReviewsService } from 'app/services/course-reviews.service';
import { DataService } from 'app/services/data.service';
import { SearchService } from 'app/services/search.service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
let StarReviewComponent = class StarReviewComponent {
    constructor(route, formBuilder, courseReviewService, dataService, searchService, alertService) {
        this.route = route;
        this.formBuilder = formBuilder;
        this.courseReviewService = courseReviewService;
        this.dataService = dataService;
        this.searchService = searchService;
        this.alertService = alertService;
        this.savedRatingEvent = new EventEmitter();
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.buildReviewForm();
        if (this.course) {
            this.courseId = this.course.courseId;
            this.updateReviewForm();
        }
        else {
            this.route.params.subscribe(params => {
                this.courseId = params.courseId;
                this.updateReviewForm();
            });
        }
        if (this.userId) {
            // user could be coach or regular. try coach first...
            this.fetchCoachProfile();
        }
        // Are we a course creator previewing own course as a student?
        this.route.queryParams.subscribe(qp => {
            if (qp.previewAsStudent) {
                this.previewAsStudent = true;
            }
        });
    }
    buildReviewForm() {
        this.reviewForm = this.formBuilder.group({
            rating: 0,
            summary: null
        });
    }
    updateReviewForm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.courseId) {
                // search user review for this course to check for previous saved review data
                // filter to only include reviews for this course from this user (should only ever be 1)
                const filters = { query: null, facets: { courseId: this.courseId, reviewerUid: this.userId } };
                const res = yield this.searchService.searchCourseReviews(1, 1, filters);
                // console.log(res.hits);
                const savedReview = res.hits[0];
                if (savedReview) { // there is a saved review, so load data
                    this.reviewForm.patchValue({
                        rating: savedReview.starValue,
                        summary: savedReview.summary ? savedReview.summary : null
                    });
                }
            }
        });
    }
    onRatingChange(value) {
        // console.log(value);
        this.reviewForm.patchValue({ rating: value });
    }
    fetchCoachProfile() {
        const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
            // console.log('coach profile:', coachProfile);
            if (coachProfile) {
                this.userProfile = coachProfile;
            }
            else { // user is not a coach, try regular...
                this.fetchRegularProfile();
            }
            tempSub.unsubscribe();
        });
        this.subscriptions.add(tempSub);
    }
    fetchRegularProfile() {
        const tempSub = this.dataService.getRegularProfile(this.userId).subscribe(regProfile => {
            // console.log('regular profile', regProfile);
            if (regProfile) {
                this.userProfile = regProfile;
            }
            tempSub.unsubscribe();
        });
        this.subscriptions.add(tempSub);
    }
    submit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.previewAsStudent) {
                this.savedRatingEvent.emit(true); // show the success msg but don't save the review
                return;
            }
            // console.log(this.reviewForm.value);
            const review = this.reviewForm.value;
            // we should have user profile details at time of calling but if not we'll fall back to 'anonymous'.
            // save the user's name & photo (if we have it) into the reviews object so it remains with the review
            // even if the user deletes their account.
            console.log('User profile:', this.userProfile);
            const data = {
                reviewerUid: this.userId,
                reviewerFirstName: (this.userProfile && this.userProfile.firstName) ? this.userProfile.firstName : 'Anonymous',
                reviewerLastName: (this.userProfile && this.userProfile.lastName) ? this.userProfile.lastName : 'Student',
                reviewerPhoto: (this.userProfile && this.userProfile.photo) ? this.userProfile.photo : null,
                sellerUid: this.course.sellerUid,
                courseId: this.course.courseId,
                starValue: review.rating,
                summary: review.summary ? review.summary : null,
                summaryExists: review.summary ? true : false,
                lastUpdated: Math.round(new Date().getTime() / 1000)
            };
            yield this.courseReviewService.setReview(data);
            this.savedRatingEvent.emit(true);
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], StarReviewComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], StarReviewComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], StarReviewComponent.prototype, "uniqueComponentString", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], StarReviewComponent.prototype, "savedRatingEvent", void 0);
StarReviewComponent = __decorate([
    Component({
        selector: 'app-star-review',
        templateUrl: './star-review.component.html',
        styleUrls: ['./star-review.component.scss']
    }),
    __metadata("design:paramtypes", [ActivatedRoute,
        FormBuilder,
        CourseReviewsService,
        DataService,
        SearchService,
        AlertService])
], StarReviewComponent);
export { StarReviewComponent };
//# sourceMappingURL=star-review.component.js.map