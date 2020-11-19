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
import { Subscription } from 'rxjs';
let DiscussionComponent = class DiscussionComponent {
    constructor(dataService) {
        this.dataService = dataService;
        this.lectureTitle = '';
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.getLectureTitle();
    }
    getLectureTitle() {
        if (this.question) {
            const courseSub = this.dataService.getPublicCourse(this.question.courseId).subscribe(course => {
                if (course) {
                    const index = course.lectures.findIndex(i => i.id === this.question.lectureId);
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
], DiscussionComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DiscussionComponent.prototype, "question", void 0);
DiscussionComponent = __decorate([
    Component({
        selector: 'app-discussion',
        templateUrl: './discussion.component.html',
        styleUrls: ['./discussion.component.scss']
    }),
    __metadata("design:paramtypes", [DataService])
], DiscussionComponent);
export { DiscussionComponent };
//# sourceMappingURL=discussion.component.js.map