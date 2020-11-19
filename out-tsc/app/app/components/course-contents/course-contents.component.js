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
let CourseContentsComponent = class CourseContentsComponent {
    constructor() { }
    ngOnInit() {
    }
    expandAllSections() {
        this.course.sections.forEach(s => {
            return s.expanded = true;
        });
    }
    fancyTimeFormat(time) {
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
    get totalLecturesRuntime() {
        let totalSeconds = 0;
        this.course.lectures.forEach(lecture => {
            if (lecture.type === 'Video' && lecture.video && lecture.video.duration) {
                totalSeconds += lecture.video.duration;
            }
        });
        return this.fancyTimeFormat(totalSeconds);
    }
    onPreviewModalHide(event) {
        // console.log(event);
        this.previewVideoDownloadUrl = null;
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseContentsComponent.prototype, "course", void 0);
CourseContentsComponent = __decorate([
    Component({
        selector: 'app-course-contents',
        templateUrl: './course-contents.component.html',
        styleUrls: ['./course-contents.component.scss']
    }),
    __metadata("design:paramtypes", [])
], CourseContentsComponent);
export { CourseContentsComponent };
//# sourceMappingURL=course-contents.component.js.map