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
let CourseResourceUploadTaskComponent = class CourseResourceUploadTaskComponent {
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
        // File type must be ??
        // if (!this.file.type.includes('video')) {
        //   this.alertService.alert('warning-message', 'Oops!',
        //   `It looks like you've added an unsupported file type. Your file must be a video.`);
        //   return;
        // }
        // File size must be below 1.0GB
        if (this.file.size > 1073741824) {
            this.alertService.alert('warning-message', 'Oops!', `It looks like your file is over 1.0GB.`);
            return;
        }
        this.inProgress = true;
        // Ensure the filename is unique, otherwise any upload with the same file name
        // will override the previous file with a new token, making the previous token obsolete
        const timestamp = Math.round(new Date().getTime() / 1000); // unix timestamp
        const uniqueFileName = this.file.name + '_' + timestamp;
        // The storage path
        const path = `users/${this.uid}/courseResources/${uniqueFileName}`;
        // Reference to storage bucket
        const ref = this.storage.ref(path);
        this.analyticsService.startCourseResourceUpload();
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
                // Update the lecture object in the lectures array to associate this resource data to the lecture
                const resource = {
                    downloadURL: this.downloadURL,
                    path,
                    fileName: uniqueFileName,
                    lastModified: this.file.lastModified,
                    lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
                };
                // init resources array if no resources saved yet
                if (!courseCopy.lectures[index].resources) {
                    courseCopy.lectures[index].resources = [];
                }
                // is resource already added to this lecture?
                const resIndex = courseCopy.lectures[index].resources.findIndex(i => i.fileName === resource.fileName);
                if (resIndex === -1) { // no
                    courseCopy.lectures[index].resources.push(resource); // add it now
                }
                else { // yes
                    courseCopy.lectures[index].resources[resIndex] = resource; // overwrite
                }
                // Update the course object now the lecture's resource array has been updated
                this.db.collection(`users/${this.uid}/courses`)
                    .doc(this.course.courseId)
                    .set(courseCopy, { merge: true });
                // Create/update the item as a user's library asset
                this.db.collection(`users/${this.uid}/courseLibrary`)
                    .doc(resource.fileName)
                    .set(resource, { merge: true });
                this.analyticsService.completeCourseResourceUpload();
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
], CourseResourceUploadTaskComponent.prototype, "uid", void 0);
__decorate([
    Input(),
    __metadata("design:type", File)
], CourseResourceUploadTaskComponent.prototype, "file", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseResourceUploadTaskComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseResourceUploadTaskComponent.prototype, "lectureId", void 0);
CourseResourceUploadTaskComponent = __decorate([
    Component({
        selector: 'app-course-resource-upload-task',
        templateUrl: './course-resource-upload-task.component.html',
        styleUrls: ['./course-resource-upload-task.component.scss']
    }),
    __metadata("design:paramtypes", [AngularFireStorage,
        AngularFirestore,
        AlertService,
        AnalyticsService])
], CourseResourceUploadTaskComponent);
export { CourseResourceUploadTaskComponent };
//# sourceMappingURL=course-resource-upload-task.component.js.map