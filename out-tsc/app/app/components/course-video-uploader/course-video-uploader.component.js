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
import { DomSanitizer } from '@angular/platform-browser';
let CourseVideoUploaderComponent = class CourseVideoUploaderComponent {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.videos = [];
    }
    ngOnInit() {
    }
    toggleHover(event) {
        this.isHovering = event;
        // console.log(event);
    }
    getDuration(event) {
        const duration = event.target.duration;
        console.log('Duration', duration);
        // add this file (will trigger upload via upload-task component init)
        const data = {
            file: this.video,
            duration
        };
        this.videos.push(data);
    }
    onDrop(event) {
        console.log(event);
        let files;
        if (event.target) { // selected
            files = event.target.files;
        }
        else { // dropped
            files = event;
        }
        console.log(files);
        for (let i = 0; i < files.length; i++) {
            // create an invisible player to get video duration before upload (triggers hidden video element load in template)
            this.video = files.item(i);
            this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.video));
        }
        const target = event.target || event.srcElement;
        target.value = ''; // reset input so we can pick the same file again
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseVideoUploaderComponent.prototype, "uid", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseVideoUploaderComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseVideoUploaderComponent.prototype, "lectureId", void 0);
CourseVideoUploaderComponent = __decorate([
    Component({
        selector: 'app-course-video-uploader',
        templateUrl: './course-video-uploader.component.html',
        styleUrls: ['./course-video-uploader.component.scss']
    }),
    __metadata("design:paramtypes", [DomSanitizer])
], CourseVideoUploaderComponent);
export { CourseVideoUploaderComponent };
//# sourceMappingURL=course-video-uploader.component.js.map