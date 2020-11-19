var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter } from '@angular/core';
let LearnLecturesNavigatorComponent = class LearnLecturesNavigatorComponent {
    constructor() {
        this.lectureCompleteEvent = new EventEmitter();
        this.baseUrl = '/course'; // default base url for navigation
    }
    ngOnInit() {
        if (this.adminMode) {
            this.baseUrl = '/admin-course-review-player'; // if in admin review mode update the base Url
        }
    }
    fancyTimeFormat(time) {
        // Catch no time
        if (!time) {
            return '0:00';
        }
        // Hours, minutes and seconds
        const hrs = Math.floor(time / 3600);
        const mins = Math.floor((time % 3600) / 60);
        const secs = Math.floor(time % 60);
        // Output like "1:01" or "4:03:59" or "123:03:59"
        let ret = '';
        if (hrs > 0) {
            ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
        }
        ret += '' + mins + ':' + (secs < 10 ? '0' : '');
        ret += '' + secs;
        return ret;
    }
    getLecturesTotalDuration(sectionIndex) {
        let seconds = 0;
        if (this.course.sections[sectionIndex].lectures) {
            this.course.sections[sectionIndex].lectures.forEach(lecture => {
                const lectureIndex = this.course.lectures.findIndex(i => i.id === lecture);
                if (lectureIndex !== -1) {
                    if (this.course.lectures[lectureIndex].type === 'Video') {
                        if (this.course.lectures[lectureIndex].video && this.course.lectures[lectureIndex].video.duration) {
                            seconds += this.course.lectures[lectureIndex].video.duration;
                        }
                    }
                }
            });
        }
        return this.fancyTimeFormat(seconds);
    }
    onLectureCompleteChange(lectureId, event) {
        const complete = event.target.checked;
        const ev = {
            lectureId,
            complete
        };
        this.lectureCompleteEvent.emit(JSON.stringify(ev));
    }
    getSectionCompletedNumLectures(sectionIndex) {
        const completedLecturesInSection = [];
        if (this.course.sections[sectionIndex].lectures) {
            this.course.sections[sectionIndex].lectures.forEach(l => {
                if (this.lecturesComplete.includes(l)) {
                    completedLecturesInSection.push(l);
                }
            });
        }
        return completedLecturesInSection.length;
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], LearnLecturesNavigatorComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], LearnLecturesNavigatorComponent.prototype, "lecturesComplete", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], LearnLecturesNavigatorComponent.prototype, "adminMode", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], LearnLecturesNavigatorComponent.prototype, "previewAsStudent", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], LearnLecturesNavigatorComponent.prototype, "lectureCompleteEvent", void 0);
LearnLecturesNavigatorComponent = __decorate([
    Component({
        selector: 'app-learn-lectures-navigator',
        templateUrl: './learn-lectures-navigator.component.html',
        styleUrls: ['./learn-lectures-navigator.component.scss']
    }),
    __metadata("design:paramtypes", [])
], LearnLecturesNavigatorComponent);
export { LearnLecturesNavigatorComponent };
//# sourceMappingURL=learn-lectures-navigator.component.js.map