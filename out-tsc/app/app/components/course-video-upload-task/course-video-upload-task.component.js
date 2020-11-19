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
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { finalize, tap } from 'rxjs/operators';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
let CourseVideoUploadTaskComponent = class CourseVideoUploadTaskComponent {
    constructor(storage, db, alertService, analyticsService) {
        this.storage = storage;
        this.db = db;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
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
        // We must have the lecture ID to associate video to lecture in the DB
        if (!this.lectureId) {
            this.alertService.alert('warning-message', 'Oops!', `Error: No lecture ID.`);
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
        // We must have a video duration
        if (!this.duration) {
            this.alertService.alert('warning-message', 'Oops!', `File duration is missing.`);
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
        const path = `users/${this.uid}/courseVideos/${uniqueFileName}`;
        // Reference to storage bucket
        const ref = this.storage.ref(path);
        this.analyticsService.startCourseVideoUpload();
        try {
            // The main task
            this.task = this.storage.upload(path, this.file);
            // Progress monitoring
            this.percentage = this.task.percentageChanges();
            this.snapshot = this.task.snapshotChanges().pipe(tap(console.log), 
            // The file's download URL
            finalize(() => __awaiter(this, void 0, void 0, function* () {
                this.downloadURL = yield ref.getDownloadURL().toPromise();
                const courseCopy = JSON.parse(JSON.stringify(this.course)); // clone the course to avoid reference errors
                // Find the index of the associated lecture in the course lectures array
                // Needed as we can't directly write to an array's index position in Firestore
                const index = courseCopy.lectures.findIndex(item => item.id === this.lectureId);
                if (index === -1) {
                    console.log('Cannot find index of lecture within course lectures array!');
                    return;
                }
                // Update the lecture object in the lectures array to associate this video data to the lecture
                courseCopy.lectures[index].video = {
                    downloadURL: this.downloadURL,
                    path,
                    fileName: uniqueFileName,
                    duration: this.duration,
                    lastModified: this.file.lastModified,
                    lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
                };
                // Update the course object now the lectures array has been updated
                this.db.collection(`users/${this.uid}/courses`)
                    .doc(this.course.courseId)
                    .set(courseCopy, { merge: true });
                // Create/update the video as a user's library asset
                this.db.collection(`users/${this.uid}/courseLibrary`)
                    .doc(courseCopy.lectures[index].video.fileName)
                    .set(courseCopy.lectures[index].video, { merge: true });
                this.analyticsService.completeCourseVideoUpload();
                // this.alertService.alert('auto-close', 'Lecture Autosaved', 'Your lecture has been auto saved successfully!');
                this.inProgress = false; // dismiss the upload progress bar when complete
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
], CourseVideoUploadTaskComponent.prototype, "uid", void 0);
__decorate([
    Input(),
    __metadata("design:type", File)
], CourseVideoUploadTaskComponent.prototype, "file", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], CourseVideoUploadTaskComponent.prototype, "duration", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseVideoUploadTaskComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseVideoUploadTaskComponent.prototype, "lectureId", void 0);
CourseVideoUploadTaskComponent = __decorate([
    Component({
        selector: 'app-course-video-upload-task',
        templateUrl: './course-video-upload-task.component.html',
        styleUrls: ['./course-video-upload-task.component.scss']
    }),
    __metadata("design:paramtypes", [AngularFireStorage,
        AngularFirestore,
        AlertService,
        AnalyticsService])
], CourseVideoUploadTaskComponent);
export { CourseVideoUploadTaskComponent };
//# sourceMappingURL=course-video-upload-task.component.js.map