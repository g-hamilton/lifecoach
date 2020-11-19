var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
let DiscussionFeedComponent = class DiscussionFeedComponent {
    constructor(route, dataService) {
        this.route = route;
        this.dataService = dataService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params.roomId) {
                this.selectedQuestionId = params.roomId;
                this.getSelectedQuestionDetail();
            }
        });
    }
    getSelectedQuestionDetail() {
        const qSub = this.dataService.getCourseQuestionById(this.selectedQuestionId).subscribe(question => {
            if (question) {
                this.selectedQuestion = question;
                this.getLectureTitle();
            }
            qSub.unsubscribe();
        });
        this.subscriptions.add(qSub);
    }
    getLectureTitle() {
        if (this.selectedQuestion) {
            const courseSub = this.dataService.getPublicCourse(this.selectedQuestion.courseId).subscribe(course => {
                if (course) {
                    const index = course.lectures.findIndex(i => i.id === this.selectedQuestion.lectureId);
                    if (index !== -1) {
                        this.lectureTitle = course.lectures[index].title;
                    }
                }
                courseSub.unsubscribe();
            });
            this.subscriptions.add(courseSub);
        }
    }
    displayDate(unix) {
        const date = new Date(unix * 1000);
        return date.toDateString();
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], DiscussionFeedComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], DiscussionFeedComponent.prototype, "feed", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], DiscussionFeedComponent.prototype, "loading", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], DiscussionFeedComponent.prototype, "done", void 0);
DiscussionFeedComponent = __decorate([
    Component({
        selector: 'app-discussion-feed',
        templateUrl: './discussion-feed.component.html',
        styleUrls: ['./discussion-feed.component.scss']
    }),
    __metadata("design:paramtypes", [ActivatedRoute,
        DataService])
], DiscussionFeedComponent);
export { DiscussionFeedComponent };
//# sourceMappingURL=discussion-feed.component.js.map