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
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let AdminCourseReviewPlayerComponent = class AdminCourseReviewPlayerComponent {
    constructor(platformId, formBuilder, cloudFunctionsService, dataService, alertService, router, route, authService, analyticsService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.cloudFunctionsService = cloudFunctionsService;
        this.dataService = dataService;
        this.alertService = alertService;
        this.router = router;
        this.route = route;
        this.authService = authService;
        this.analyticsService = analyticsService;
        this.lecturesComplete = [];
        this.videoSources = [];
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.getRouteData();
            this.getUserData();
            this.buildRejectForm();
        }
    }
    getRouteData() {
        this.route.params.subscribe(params => {
            if (params.courseId) {
                this.courseId = params.courseId;
                console.log('Activated course ID', this.courseId);
                this.loadReviewRequest();
            }
        });
    }
    getUserData() {
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                this.userId = user.uid;
            }
        }));
    }
    buildRejectForm() {
        this.rejectForm = this.formBuilder.group({
            reason: ['', [Validators.required]]
        });
    }
    loadReviewRequest() {
        this.subscriptions.add(this.dataService.getCourseReviewRequest(this.courseId).subscribe(data => {
            if (data) {
                this.reviewRequest = data;
                if (this.reviewRequest.sellerUid) {
                    this.loadCourse();
                }
                else {
                    console.error('No seller UID - cannot load course!');
                }
            }
        }));
    }
    loadCourse() {
        this.subscriptions.add(this.dataService.getPrivateCourse(this.reviewRequest.sellerUid, this.courseId).subscribe(course => {
            if (course) {
                this.course = course;
                console.log('Course loaded:', this.course);
                this.checkLectureId();
            }
        }));
    }
    checkLectureId() {
        // Check activated route params for lecture ID
        this.route.params.subscribe(params => {
            this.lectureId = params.lectureId;
            if (this.lectureId) {
                this.loadRequestedLecture();
                this.checkActiveSectionIndex();
            }
            else {
                this.loadDefaultLecture();
                this.activeSectionIndex = 0;
            }
        });
    }
    loadDefaultLecture() {
        // redirect to the first lecture in the course
        const orderedLectures = [];
        if (this.course.sections) {
            this.course.sections.forEach(s => {
                if (s.lectures) {
                    s.lectures.forEach(l => {
                        orderedLectures.push(l);
                    });
                }
            });
        }
        const firstLecture = orderedLectures[0];
        if (firstLecture) {
            this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', firstLecture]);
        }
    }
    loadRequestedLecture() {
        // load the requested lecture
        console.log(`Load requested lecture: ${this.lectureId}`);
        const lectureIndex = this.course.lectures.findIndex(i => i.id === this.lectureId);
        if (lectureIndex === -1) { // lecture not found!
            this.alertService.alert('warning-message', 'Oops', 'Lecture not found!');
            return;
        }
        this.lecture = this.course.lectures[lectureIndex];
        console.log('Lecture loaded:', this.lecture);
        if (this.lecture.type === 'Video') {
            this.loadVideo();
        }
    }
    checkActiveSectionIndex() {
        // check which section the current lecture is contained in
        const index = this.course.sections.findIndex(i => {
            if (i.lectures) {
                return i.lectures.includes(this.lectureId);
            }
            return -1;
        });
        if (index === -1) {
            console.log('Unable to determine active section index!');
            return;
        }
        this.activeSectionIndex = index;
        console.log('Active section index:', index);
    }
    loadVideo() {
        this.videoSources = [];
        this.videoSources.push(this.lecture.video.downloadURL);
    }
    onPlayerReady(api) {
        // fires when the videoGular player is ready
        this.vgApi = api;
        // listen for the data loaded event
        this.vgApi.getDefaultMedia().subscriptions.loadedData.subscribe($event => {
            console.log('Video loaded data', $event);
            // seek to bookmark point if requested
            // this.checkForBookmark();
        });
        // listen for the video ended event
        this.vgApi.getDefaultMedia().subscriptions.ended.subscribe($event => {
            console.log('Video ended:', $event);
            // save lecture complete for this user
            // this.saveLectureComplete(this.lectureId);
            // redirect to the next lecture in the course
            if (this.activeSectionIndex !== undefined) {
                // is this the last lecture in the active section?
                const lIndex = this.course.sections[this.activeSectionIndex].lectures.findIndex(i => i === this.lectureId);
                if (lIndex === -1) {
                    console.log('Lecture not found in active section!');
                    return;
                }
                if (lIndex === this.course.sections[this.activeSectionIndex].lectures.length - 1) {
                    // yes, is this the last section in the course?
                    if (this.activeSectionIndex === this.course.sections.length - 1) {
                        // yes, ???
                        console.log('Completed the final lecture in this course!');
                        return;
                    }
                    // no, load the first lecture in the next section
                    const nextSectionLectureId = this.course.sections[this.activeSectionIndex + 1].lectures[0];
                    this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', nextSectionLectureId]);
                }
                // no, safe to load next lecture
                const nextLectureId = this.course.sections[this.activeSectionIndex].lectures[lIndex + 1];
                this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', nextLectureId]);
            }
            else {
                console.log('Unable to redirect to next lecture. Active section index not set yet!');
            }
        });
        // end video ended event listener
    }
    onLectureCompleteChange(event) {
        const ev = JSON.parse(event);
        // Do nothing deliberately
    }
    get rejectF() {
        return this.rejectForm.controls;
    }
    getDisplayDate(unix) {
        const date = new Date(unix * 1000);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[date.getDay()];
        return `${day} ${date.toLocaleDateString()}`;
    }
    approveCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            this.approving = true;
            // safety checks
            if (!this.reviewRequest) {
                this.alertService.alert('warning-message', 'Oops', 'Missing review request. Unable to approve course.');
                this.approving = false;
                return;
            }
            if (!this.courseId) {
                this.alertService.alert('warning-message', 'Oops', 'Missing course ID. Unable to approve course.');
                this.approving = false;
                return;
            }
            if (!this.userId) {
                this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve course.');
                this.approving = false;
                return;
            }
            // attempt approval
            const res = yield this.alertService.alert('warning-message-and-confirmation', 'Confirm', 'Confirm course approval.', 'Yes - Confirm');
            if (res && res.action) { // user confirms
                console.log('Sending course review approval:', this.courseId, this.userId, this.reviewRequest);
                const response = yield this.cloudFunctionsService.adminApproveCourseReview(this.courseId, this.userId, this.reviewRequest);
                if (response.error) { // error
                    this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
                    this.approving = false;
                    return;
                }
                // success
                this.analyticsService.adminApproveCourse(this.courseId);
                yield this.alertService.alert('success-message', 'Success!', 'Course Approved.');
                this.router.navigate(['/admin-course-review']);
            }
            this.approving = false;
        });
    }
    rejectCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            this.rejecting = true;
            // safety checks
            if (!this.courseId) {
                this.alertService.alert('warning-message', 'Oops', 'Missing course ID. Unable to reject course.');
                this.rejecting = false;
                return;
            }
            if (!this.userId) {
                this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve course.');
                this.rejecting = false;
                return;
            }
            if (this.rejectForm.invalid) {
                this.alertService.alert('warning-message', 'Oops', 'Invalid form data.');
                this.rejecting = false;
                return;
            }
            if (!this.reviewRequest) {
                this.alertService.alert('warning-message', 'Oops', 'Missing review request data.');
                this.rejecting = false;
                return;
            }
            // update the review request object with reject data
            this.reviewRequest.rejectData = this.rejectForm.value;
            // attemp rejection
            const response = yield this.cloudFunctionsService.adminRejectCourseReview(this.courseId, this.userId, this.reviewRequest);
            if (response.error) { // error
                this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
                this.rejecting = false;
                return;
            }
            // success
            this.rejecting = false;
            this.analyticsService.adminRejectCourse(this.courseId);
            yield this.alertService.alert('success-message', 'Success!', 'Course rejected. Feedback sent to course creator.');
            this.router.navigate(['/admin-course-review']);
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
AdminCourseReviewPlayerComponent = __decorate([
    Component({
        selector: 'app-admin-course-review-player',
        templateUrl: './admin-course-review-player.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        CloudFunctionsService,
        DataService,
        AlertService,
        Router,
        ActivatedRoute,
        AuthService,
        AnalyticsService])
], AdminCourseReviewPlayerComponent);
export { AdminCourseReviewPlayerComponent };
//# sourceMappingURL=admin-course-review-player.component.js.map