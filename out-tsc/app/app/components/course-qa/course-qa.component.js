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
import { Component, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { SearchService } from 'app/services/search.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let CourseQaComponent = class CourseQaComponent {
    constructor(formBuilder, dataService, alertService, searchService, analyticsService) {
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.alertService = alertService;
        this.searchService = searchService;
        this.analyticsService = analyticsService;
        this.totalHits = 0;
        this.hitsPerPage = 10;
        this.page = 1;
        this.maxSize = 10;
        this.titleMinLength = 6;
        this.titleMaxLength = 255;
        this.titleActualLength = 0;
        this.errorMessages = {
            title: {
                minlength: `Lecture titles should be at least ${this.titleMinLength} characters.`,
                maxlength: `Lecture titles should be at less than ${this.titleMaxLength} characters.`
            }
        };
        this.objKeys = Object.keys;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.buildCourseQuestionForm();
        this.buildPlatformQuestionForm();
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewLoaded = true;
        }, 100);
    }
    ngOnChanges() {
        if (this.userId && !this.userProfile) {
            // user could be coach or regular. try coach first...
            this.fetchCoachProfile();
        }
        if (this.course && !this.questions) {
            this.loadInitialQuestions(this.page);
        }
        if (this.course && !this.liveCourse) {
            // NB: as the parent component does not pass in an active course subscription (deliberately),
            // subscribe to the course and keep monitoring to update when question total changes in realtime.
            this.subscriptions.add(this.dataService.getUnlockedPublicCourse(this.course.courseId).subscribe(course => {
                if (course) {
                    this.liveCourse = course;
                    this.totalHits = course.questions;
                }
            }));
        }
    }
    buildCourseQuestionForm() {
        this.courseQuestionForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
            detail: [null]
        });
    }
    buildPlatformQuestionForm() {
        this.platformQuestionForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
            detail: [null]
        });
    }
    fetchCoachProfile() {
        const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
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
            if (regProfile) {
                this.userProfile = regProfile;
            }
            tempSub.unsubscribe();
        });
        this.subscriptions.add(tempSub);
    }
    loadInitialQuestions(page) {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptions.add(this.dataService.getInitialCourseQuestions(this.course.courseId, this.hitsPerPage).subscribe(items => {
                // console.log(items);
                if (items.length) {
                    this.questions = items;
                }
            }));
        });
    }
    loadNextQuestions() {
        const lastDoc = this.questions[this.questions.length - 1];
        this.subscriptions.add(this.dataService.getNextCourseQuestions(this.course.courseId, this.hitsPerPage, lastDoc).subscribe(items => {
            console.log(items);
            if (items.length) {
                this.questions = items;
            }
        }));
    }
    loadPreviousQuestions() {
        const firstDoc = this.questions[0];
        this.subscriptions.add(this.dataService.getPreviousCourseQuestions(this.course.courseId, this.hitsPerPage, firstDoc).subscribe(items => {
            console.log(items);
            if (items.length) {
                this.questions = items;
            }
        }));
    }
    get cQF() {
        return this.courseQuestionForm.controls;
    }
    get pQF() {
        return this.platformQuestionForm.controls;
    }
    showError(control, error) {
        if (this.errorMessages[control][error]) {
            return this.errorMessages[control][error];
        }
        return 'Invalid input';
    }
    onTitleInput(ev) {
        this.titleActualLength = ev.target.value.length;
    }
    receivePageUpdate(event) {
        console.log(event);
        const requestedPage = event;
        if (requestedPage > this.page) { // we're going forwards
            this.loadNextQuestions();
            this.page = requestedPage;
        }
        else if (requestedPage < this.page) { // we're going backwards
            this.loadPreviousQuestions();
            this.page = requestedPage;
        }
    }
    onSearchEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Search event:', event);
            const filters = {
                query: event,
                facets: {
                    courseId: this.course.courseId,
                    type: 'course'
                }
            };
            const res = yield this.searchService.searchCourseQuestions(this.hitsPerPage, this.page, filters);
            console.log(res);
            if (res && res.nbHits) {
                this.questions = res.hits;
                this.totalHits = res.nbHits;
            }
        });
    }
    popQuestionModal() {
        if (this.questionType === 'course') {
            this.courseQuestionModal.show();
        }
        if (this.questionType === 'platform') {
            // this.platformQuestionModal.show();
            // NOT currently used. Redirecting all tech questions via freshdesk
        }
    }
    askCourseQuestion() {
        return __awaiter(this, void 0, void 0, function* () {
            // safety checks
            if (this.courseQuestionForm.invalid) {
                console.log('Invalid course question form!');
                return;
            }
            if (!this.userId) {
                console.log('Missing user ID!');
                return;
            }
            const qf = this.courseQuestionForm.value;
            // console.log(qf);
            const question = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'course',
                title: qf.title,
                askerUid: this.userId,
                askerFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
                askerLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
                courseId: this.course.courseId,
                courseSellerId: this.course.sellerUid,
                lectureId: this.lecture.id,
                created: Math.round(new Date().getTime() / 1000),
                askerPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
                detail: qf.detail
            };
            // console.log(question);
            this.analyticsService.askCourseQuestion(question);
            yield this.dataService.saveCourseQuestion(question);
            this.alertService.alert('success-message', 'Success!', 'Your question has been posted.');
        });
    }
    askPlatformQuestion() {
        return __awaiter(this, void 0, void 0, function* () {
            // safety checks
            if (this.platformQuestionForm.invalid) {
                console.log('Invalid platform question form!');
                return;
            }
            if (!this.userId) {
                console.log('Missing user ID!');
                return;
            }
            const qf = this.platformQuestionForm.value;
            console.log(qf);
            const question = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'platform',
                title: qf.title,
                askerUid: this.userId,
                askerFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
                askerLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
                courseId: this.course.courseId,
                courseSellerId: this.course.sellerUid,
                lectureId: this.lecture.id,
                created: Math.round(new Date().getTime() / 1000),
                askerPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
                detail: qf.detail
            };
            // console.log(question);
            this.analyticsService.askCourseQuestion(question);
            yield this.dataService.saveCourseQuestion(question);
            this.alertService.alert('success-message', 'Success!', 'Your question has been posted.');
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseQaComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseQaComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseQaComponent.prototype, "lecture", void 0);
__decorate([
    ViewChild('courseQuestionModal', { static: false }),
    __metadata("design:type", ModalDirective)
], CourseQaComponent.prototype, "courseQuestionModal", void 0);
__decorate([
    ViewChild('platformQuestionModal', { static: false }),
    __metadata("design:type", ModalDirective)
], CourseQaComponent.prototype, "platformQuestionModal", void 0);
CourseQaComponent = __decorate([
    Component({
        selector: 'app-course-qa',
        templateUrl: './course-qa.component.html',
        styleUrls: ['./course-qa.component.scss']
    }),
    __metadata("design:paramtypes", [FormBuilder,
        DataService,
        AlertService,
        SearchService,
        AnalyticsService])
], CourseQaComponent);
export { CourseQaComponent };
//# sourceMappingURL=course-qa.component.js.map