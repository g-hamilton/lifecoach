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
let AdminVideoUploaderComponent = class AdminVideoUploaderComponent {
    constructor() {
        this.vidUploadedEvent = new EventEmitter(); // <-- So we can emit the chosen data to a parent component
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
    onVideoUploadEvent(ev) {
        // Emit the promo video object to be saved into the course
        this.vidUploadedEvent.emit(ev);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], AdminVideoUploaderComponent.prototype, "uid", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], AdminVideoUploaderComponent.prototype, "vidUploadedEvent", void 0);
AdminVideoUploaderComponent = __decorate([
    Component({
        selector: 'app-admin-video-uploader',
        templateUrl: './admin-video-uploader.component.html',
        styleUrls: ['./admin-video-uploader.component.scss']
    }),
    __metadata("design:paramtypes", [])
], AdminVideoUploaderComponent);
export { AdminVideoUploaderComponent };
//# sourceMappingURL=admin-video-uploader.component.js.map