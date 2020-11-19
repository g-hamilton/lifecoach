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
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
let AdminCourseReviewsComponent = class AdminCourseReviewsComponent {
    constructor(platformId, cloudFunctionsService, dataService, alertService) {
        this.platformId = platformId;
        this.cloudFunctionsService = cloudFunctionsService;
        this.dataService = dataService;
        this.alertService = alertService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.page = 1;
            this.itemsPerPage = 10;
            this.maxSize = 10;
            this.monitorReviewRequests();
            this.getInitialAdminCoursesInReview();
        }
    }
    timestampToDate(timestamp) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }
    monitorReviewRequests() {
        // get the total number of courses in review for pagination
        this.subscriptions.add(this.dataService.getTotalAdminCoursesInReview().subscribe(total => {
            if (total) {
                this.totalItems = total.totalRecords;
            }
        }));
    }
    getInitialAdminCoursesInReview() {
        const tempSub = this.dataService.getInitialAdminCoursesInReview(this.itemsPerPage).subscribe(data => {
            if (data) {
                console.log('Courses in review initial results:', data);
                this.results = data;
            }
            tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
        });
        this.subscriptions.add(tempSub);
    }
    loadNextResults() {
        const lastDoc = this.results[this.results.length - 1];
        const tempSub = this.dataService.getNextAdminCoursesInReview(this.itemsPerPage, lastDoc).subscribe(data => {
            console.log('Courses in review next results:', data);
            if (data.length) {
                this.results = data;
            }
            tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
        });
        this.subscriptions.add(tempSub);
    }
    loadPreviousResults() {
        const firstDoc = this.results[0];
        const tempSub = this.dataService.getPreviousAdminCoursesInReview(this.itemsPerPage, firstDoc).subscribe(data => {
            this.results = data;
            if (data.length) {
                console.log('Courses in review previous results:', data);
            }
            tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
        });
        this.subscriptions.add(tempSub);
    }
    pageChanged(event) {
        console.log(event.page);
        const requestedPage = event.page;
        if (requestedPage > this.page) { // we're going forwards
            this.loadNextResults();
            this.page = requestedPage;
        }
        else if (requestedPage < this.page) { // we're going backwards
            this.loadPreviousResults();
            this.page = requestedPage;
        }
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
AdminCourseReviewsComponent = __decorate([
    Component({
        selector: 'app-admin-course-reviews',
        templateUrl: './admin-course-reviews.component.html',
        styleUrls: ['./admin-course-reviews.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, CloudFunctionsService,
        DataService,
        AlertService])
], AdminCourseReviewsComponent);
export { AdminCourseReviewsComponent };
//# sourceMappingURL=admin-course-reviews.component.js.map