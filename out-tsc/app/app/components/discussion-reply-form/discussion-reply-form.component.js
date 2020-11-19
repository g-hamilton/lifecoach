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
import { FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
let DiscussionReplyFormComponent = class DiscussionReplyFormComponent {
    constructor(formBuilder, dataService, alertService, analyticsService, route) {
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.route = route;
    }
    ngOnInit() {
        this.buildReplyForm();
        this.checkRouteForQuestionId();
    }
    buildReplyForm() {
        this.replyForm = this.formBuilder.group({
            message: ['', [Validators.required]]
        });
    }
    checkRouteForQuestionId() {
        this.route.params.subscribe(params => {
            if (params && params.roomId) {
                this.questionId = params.roomId;
            }
        });
    }
    get replyF() {
        return this.replyForm.controls;
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
            if (!this.questionId) {
                console.log('Missing selected question Id!');
                return;
            }
            this.analyticsService.sendCourseDiscussionReply();
            const rf = this.replyForm.value;
            console.log(rf);
            const reply = {
                id: Math.random().toString(36).substr(2, 9),
                questionId: this.questionId,
                replierUid: this.userId,
                replierFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
                replierLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
                created: Math.round(new Date().getTime() / 1000),
                replierPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
                detail: rf.message
            };
            console.log(reply);
            yield this.dataService.saveCourseReply(reply);
            this.replyForm.patchValue({ detail: null }); // reset form detail field
            this.alertService.alert('success-message', 'Success!', 'Your reply has been posted.');
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], DiscussionReplyFormComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], DiscussionReplyFormComponent.prototype, "roomId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DiscussionReplyFormComponent.prototype, "userProfile", void 0);
DiscussionReplyFormComponent = __decorate([
    Component({
        selector: 'app-discussion-reply-form',
        templateUrl: './discussion-reply-form.component.html',
        styleUrls: ['./discussion-reply-form.component.scss']
    }),
    __metadata("design:paramtypes", [FormBuilder,
        DataService,
        AlertService,
        AnalyticsService,
        ActivatedRoute])
], DiscussionReplyFormComponent);
export { DiscussionReplyFormComponent };
//# sourceMappingURL=discussion-reply-form.component.js.map