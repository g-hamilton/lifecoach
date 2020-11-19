var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Component, Input, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TabsetComponent } from 'ngx-bootstrap';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';
let CourseLectureComponent = class CourseLectureComponent {
    constructor(platformId, formBuilder, dataService, router, alertService, analyticsService, storageService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.router = router;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.storageService = storageService;
        this.titleMinLength = 4;
        this.titleMaxLength = 100;
        this.titleActualLength = 0;
        this.errorMessages = {
            title: {
                minlength: `Lecture titles should be at least ${this.titleMinLength} characters.`,
                maxlength: `Lecture titles should be at less than ${this.titleMaxLength} characters.`
            }
        };
        this.objKeys = Object.keys;
        this.videoSources = [];
        this.tinymceInit = {
            height: 300,
            menubar: false,
            plugins: 'link lists paste image',
            toolbar: 'undo redo | formatselect | paste | bold italic backcolor link image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
            /* we override default upload handler to simulate successful upload */
            images_upload_handler: (blobInfo, success, failure) => {
                this.handleTinyImageUpload(blobInfo.blob()).then((imageUrl) => {
                    success(imageUrl);
                }).catch((error) => {
                    failure(error);
                });
            }
        };
    }
    ngOnInit() {
        console.log(this.userId);
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.buildLectureForm();
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewLoaded = true;
        }, 100);
    }
    ngOnChanges() {
        if (this.course && this.activatedLectureId) {
            this.loadLecture();
        }
    }
    buildLectureForm() {
        this.lectureForm = this.formBuilder.group({
            id: ['', [Validators.required]],
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
            type: ['Video', [Validators.required]],
            video: [null],
            article: [null],
            preview: [false],
            includeResources: [false],
            resources: [null]
        });
    }
    handleTinyImageUpload(blob) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('BLOB', blob);
            return yield this.storageService.storeTinyMceImage(blob, this.userId);
        });
    }
    get lectureF() {
        return this.lectureForm.controls;
    }
    loadLecture() {
        const matches = this.course.lectures.filter(item => item.id === this.activatedLectureId);
        const lecture = matches[0]; // should only be 1 matching section id
        this.lectureForm.patchValue({
            id: lecture.id,
            title: lecture.title,
            type: lecture.type ? lecture.type : 'Video',
            video: lecture.video ? lecture.video : null,
            article: lecture.article ? lecture.article : null,
            preview: lecture.preview ? lecture.preview : false,
            includeResources: lecture.includeResources ? lecture.includeResources : false,
            resources: lecture.resources ? lecture.resources : null
        });
        if (lecture.video) {
            this.videoSources = []; // reset
            this.videoSources.push({
                src: this.lectureF.video.value.downloadURL
            });
        }
        // manually open the correct lecture type tab for the user
        if (lecture.type === 'Video') {
            setTimeout(() => {
                this.lectureTypeTabs.tabs[0].active = true; // manually open the video tab
            }, 100);
        }
        else if (lecture.type === 'Article') {
            setTimeout(() => {
                this.lectureTypeTabs.tabs[1].active = true; // manually open the article tab
            }, 100);
        }
    }
    showError(control, error) {
        if (this.errorMessages[control][error]) {
            return this.errorMessages[control][error];
        }
        return 'Invalid input';
    }
    onTitleInput(ev) {
        this.titleActualLength = ev.target.value.length;
    }
    onLectureTypeTabSelect(event) {
        this.lectureForm.patchValue({
            type: event.heading
        });
        // console.log(this.lectureForm.value);
    }
    onIncludeResourcesChange(event) {
        this.onSubmit(true); // autosave
    }
    onPreviewChange(event) {
        this.onSubmit(true); // autosave
    }
    onLibraryItemSelectVideo(event) {
        // TODO check file is a video!
        console.log('Video selected from library:', event);
        this.lectureForm.patchValue({
            video: event
        });
        this.videoSources = []; // reset
        this.videoSources.push({
            src: event.downloadURL
        });
    }
    onLibraryItemSelectResource(event) {
        console.log('Resource selected from library:', event);
        const resArray = this.lectureF.resources.value;
        if (!resArray) { // no resources. init new array with selected element
            this.lectureForm.patchValue({ resources: [event] });
            this.onSubmit(true); // autosave
            return;
        }
        resArray.push(event); // add the selected element to the resources array
        this.lectureForm.patchValue({ resources: resArray });
        this.onSubmit(true); // autosave
    }
    removeResource(index) {
        const resArray = this.lectureF.resources.value;
        resArray.splice(index, 1);
        this.lectureForm.patchValue({ resources: JSON.parse(JSON.stringify(resArray)) });
    }
    onSubmit(silenceSuccessAlert) {
        return __awaiter(this, void 0, void 0, function* () {
            this.saving = true;
            // If this is a new lecture
            if (this.isNewLecture && !this.lectureF.id.value) {
                const lectureId = Math.random().toString(36).substr(2, 9); // generate semi-random id
                this.lectureForm.patchValue({ id: lectureId }); // update form with new id
            }
            // Safety checks
            if (this.lectureForm.invalid) {
                console.log('Invalid form');
                this.saving = false;
                return;
            }
            if (!this.course) {
                console.log('No course to associate lecture with!');
                this.saving = false;
                return;
            }
            if (!this.activatedSectionId) {
                console.log('No section to associate lecture with!');
                this.saving = false;
                return;
            }
            // Ensure lectures array exists
            if (!this.course.lectures) {
                this.course.lectures = [];
            }
            // If we're creating a new lecture
            if (this.isNewLecture) {
                // add the lecture into the course object
                this.course.lectures.push(this.lectureForm.value);
                // and associate it's lecture id with the appropriate section by adding it's id to the section lectures array
                const i = this.course.sections.findIndex(item => item.id === this.activatedSectionId);
                if (i !== -1) {
                    if (!this.course.sections[i].lectures) {
                        this.course.sections[i].lectures = [];
                    }
                    this.course.sections[i].lectures.push(this.lectureF.id.value);
                }
                this.analyticsService.createCourseLecture(this.lectureForm.value);
            }
            // If we're editing an existing lecture
            if (this.activatedLectureId) {
                const i = this.course.lectures.findIndex(item => item.id === this.activatedLectureId);
                if (i !== -1) {
                    this.course.lectures[i] = this.lectureForm.value;
                }
                this.analyticsService.editCourseLecture();
            }
            // Save the course object
            const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
            yield this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);
            this.saving = false;
            if (!silenceSuccessAlert) {
                this.alertService.alert('auto-close', 'Success!', 'Your lecture has been saved successfully!');
            }
            // Navigate to relevant section url
            this.router.navigate(['my-courses', this.course.courseId, 'content', 'section', this.activatedSectionId, 'lecture', this.lectureF.id.value], { queryParams: { targetUser: this.userId } });
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseLectureComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], CourseLectureComponent.prototype, "isNewLecture", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseLectureComponent.prototype, "activatedSectionId", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseLectureComponent.prototype, "activatedLectureId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseLectureComponent.prototype, "course", void 0);
__decorate([
    ViewChild('lectureTypeTabs', { static: false }),
    __metadata("design:type", TabsetComponent)
], CourseLectureComponent.prototype, "lectureTypeTabs", void 0);
CourseLectureComponent = __decorate([
    Component({
        selector: 'app-course-lecture',
        templateUrl: './course-lecture.component.html',
        styleUrls: ['./course-lecture.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        DataService,
        Router,
        AlertService,
        AnalyticsService,
        StorageService])
], CourseLectureComponent);
export { CourseLectureComponent };
//# sourceMappingURL=course-lecture.component.js.map