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
import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { SearchService } from 'app/services/search.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let CourseQaResultsComponent = class CourseQaResultsComponent {
    constructor(formBuilder, dataService, alertService, searchService, analyticsService) {
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.alertService = alertService;
        this.searchService = searchService;
        this.analyticsService = analyticsService;
        this.hitsPerPage = 6;
        this.page = 1;
        this.maxSize = 10;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.buildReplyForm();
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewLoaded = true;
        }, 100);
    }
    buildReplyForm() {
        this.replyForm = this.formBuilder.group({
            detail: [null]
        });
    }
    getLectureTitle(lectureId) {
        if (this.course) {
            const index = this.course.lectures.findIndex(i => i.id === lectureId);
            if (index !== -1) {
                return this.course.lectures[index].title;
            }
            return '';
        }
        return '';
    }
    displayDate(unix) {
        const date = new Date(unix * 1000);
        return date.toDateString();
    }
    upVote(question) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('upvote', question);
            this.alertService.alert('auto-close', 'Success', 'Thanks for upvoting this question!');
            yield this.dataService.upVoteCourseQuestion(question, this.userId);
        });
    }
    upVoteReply(reply) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('upvote', reply);
            this.alertService.alert('auto-close', 'Success', 'Thanks for upvoting this reply!');
            yield this.dataService.upVoteCourseQuestionReply(reply, this.userId);
        });
    }
    loadSelectedQuestionReplies() {
        this.subscriptions.add(this.dataService.getInitialQuestionReplies(this.selectedQuestion.id, this.hitsPerPage).subscribe(items => {
            console.log(items);
            if (items.length) {
                this.replies = items;
            }
        }));
    }
    loadNextQuestionReplies() {
        const lastDoc = this.replies[this.replies.length - 1];
        this.subscriptions.add(this.dataService.getNextQuestionReplies(this.selectedQuestion.id, this.hitsPerPage, lastDoc).subscribe(items => {
            console.log(items);
            if (items.length) {
                this.replies = items;
            }
        }));
    }
    loadPreviousQuestionReplies() {
        const firstDoc = this.replies[0];
        this.subscriptions.add(this.dataService.getPreviousQuestionReplies(this.selectedQuestion.id, this.hitsPerPage, firstDoc).subscribe(items => {
            console.log(items);
            if (items.length) {
                this.replies = items;
            }
        }));
    }
    receivePageUpdate(event) {
        console.log(event);
        const requestedPage = event;
        if (requestedPage > this.page) { // we're going forwards
            this.loadNextQuestionReplies();
            this.page = requestedPage;
        }
        else if (requestedPage < this.page) { // we're going backwards
            this.loadPreviousQuestionReplies();
            this.page = requestedPage;
        }
    }
    addReply() {
        return __awaiter(this, void 0, void 0, function* () {
            // safety checks
            if (this.replyForm.invalid) {
                console.log('Invalid reply form!');
                return;
            }
            if (!this.userId) {
                console.log('Missing user ID!');
                return;
            }
            if (!this.selectedQuestion || !this.selectedQuestion.id) {
                console.log('Missing selected question!');
                return;
            }
            const rf = this.replyForm.value;
            console.log(rf);
            const reply = {
                id: Math.random().toString(36).substr(2, 9),
                questionId: this.selectedQuestion.id,
                replierUid: this.userId,
                replierFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
                replierLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
                created: Math.round(new Date().getTime() / 1000),
                replierPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
                detail: rf.detail
            };
            console.log(reply);
            this.analyticsService.sendCourseDiscussionReply();
            yield this.dataService.saveCourseReply(reply);
            this.replyForm.patchValue({ detail: null }); // reset form detail field
            this.alertService.alert('success-message', 'Success!', 'Your reply has been posted.');
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseQaResultsComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseQaResultsComponent.prototype, "userProfile", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseQaResultsComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], CourseQaResultsComponent.prototype, "results", void 0);
CourseQaResultsComponent = __decorate([
    Component({
        selector: 'app-course-qa-results',
        templateUrl: './course-qa-results.component.html',
        styleUrls: ['./course-qa-results.component.scss']
    }),
    __metadata("design:paramtypes", [FormBuilder,
        DataService,
        AlertService,
        SearchService,
        AnalyticsService])
], CourseQaResultsComponent);
export { CourseQaResultsComponent };
//# sourceMappingURL=course-qa-results.component.js.map