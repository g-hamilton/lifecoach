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
let CourseResourceUploaderComponent = class CourseResourceUploaderComponent {
    constructor() {
        this.files = [];
    }
    ngOnInit() {
    }
    toggleHover(event) {
        this.isHovering = event;
        // console.log(event);
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
            this.files.push(files.item(i));
        }
        const target = event.target || event.srcElement;
        target.value = ''; // reset input so we can pick the same file again
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseResourceUploaderComponent.prototype, "uid", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseResourceUploaderComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseResourceUploaderComponent.prototype, "lectureId", void 0);
CourseResourceUploaderComponent = __decorate([
    Component({
        selector: 'app-course-resource-uploader',
        templateUrl: './course-resource-uploader.component.html',
        styleUrls: ['./course-resource-uploader.component.scss']
    }),
    __metadata("design:paramtypes", [])
], CourseResourceUploaderComponent);
export { CourseResourceUploaderComponent };
//# sourceMappingURL=course-resource-uploader.component.js.map