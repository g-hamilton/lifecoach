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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { finalize, tap } from 'rxjs/operators';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
let CoursePromoVideoUploadTaskComponent = class CoursePromoVideoUploadTaskComponent {
    constructor(storage, db, alertService, analyticsService) {
        this.storage = storage;
        this.db = db;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.promoVidUploadedEvent = new EventEmitter(); // <-- So we can emit the chosen data to a parent component
    }
    ngOnInit() {
        this.startUpload();
    }
    startUpload() {
        // We must have the course ID to associate video in storage
        if (!this.course.courseId) {
            this.alertService.alert('warning-message', 'Oops!', `Error: No course ID.`);
            return;
        }
        // File type must be video
        if (!this.file.type.includes('video')) {
            this.alertService.alert('warning-message', 'Oops!', `It looks like you've added an unsupported file type. Your file must be a video.`);
            return;
        }
        // File type must be .mp4
        if (!this.file.type.includes('mp4')) {
            this.alertService.alert('warning-message', 'Oops!', `Videos must be .mp4 file format to ensure correct playback on all devices.`);
            return;
        }
        // File size must be below 4.0GB
        if (this.file.size > 4294967296) {
            this.alertService.alert('warning-message', 'Oops!', `It looks like your video file is over 4.0GB. Try a shorter video or reducing the quality a little to create a smaller file.`);
            return;
        }
        this.inProgress = true;
        // Ensure the filename is unique, otherwise any upload with the same file name
        // will override the previous file with a new token, making the previous token obsolete
        const timestamp = Math.round(new Date().getTime() / 1000); // unix timestamp
        const uniqueFileName = this.file.name + '_' + timestamp;
        // The storage path
        const path = `users/${this.uid}/coursePromoVideos/${uniqueFileName}`;
        // Reference to storage bucket
        const ref = this.storage.ref(path);
        this.analyticsService.startCoursePromoVideoUpload();
        try {
            // The main task
            this.task = this.storage.upload(path, this.file);
            // Progress monitoring
            this.percentage = this.task.percentageChanges();
            this.snapshot = this.task.snapshotChanges().pipe(tap(console.log), 
            // The file's download URL
            finalize(() => __awaiter(this, void 0, void 0, function* () {
                this.downloadURL = yield ref.getDownloadURL().toPromise();
                // Associate this video data to the course
                const promoVideo = {
                    downloadURL: this.downloadURL,
                    path,
                    fileName: uniqueFileName,
                    lastModified: this.file.lastModified,
                    lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
                };
                // Create/update the video as a user's library asset
                this.db.collection(`users/${this.uid}/courseLibrary`)
                    .doc(promoVideo.fileName)
                    .set(promoVideo, { merge: true });
                this.analyticsService.completeCoursePromoVideoUpload();
                this.inProgress = false; // dismiss the upload progress bar when complete
                // Emit the promo video object to be saved into the course
                this.promoVidUploadedEvent.emit(promoVideo);
            })));
        }
        catch (err) {
            console.error(err);
        }
    }
    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CoursePromoVideoUploadTaskComponent.prototype, "uid", void 0);
__decorate([
    Input(),
    __metadata("design:type", File)
], CoursePromoVideoUploadTaskComponent.prototype, "file", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CoursePromoVideoUploadTaskComponent.prototype, "course", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], CoursePromoVideoUploadTaskComponent.prototype, "promoVidUploadedEvent", void 0);
CoursePromoVideoUploadTaskComponent = __decorate([
    Component({
        selector: 'app-course-promo-video-upload-task',
        templateUrl: './course-promo-video-upload-task.component.html',
        styleUrls: ['./course-promo-video-upload-task.component.scss']
    }),
    __metadata("design:paramtypes", [AngularFireStorage,
        AngularFirestore,
        AlertService,
        AnalyticsService])
], CoursePromoVideoUploadTaskComponent);
export { CoursePromoVideoUploadTaskComponent };
//# sourceMappingURL=course-promo-video-upload-task.component.js.map