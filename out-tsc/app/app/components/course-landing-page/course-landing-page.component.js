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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
let CourseLandingPageComponent = class CourseLandingPageComponent {
    constructor(platformId, formBuilder, dataService, alertService, analyticsService, storageService, specialitiesService, languagesService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.storageService = storageService;
        this.specialitiesService = specialitiesService;
        this.languagesService = languagesService;
        this.titleMinLength = 10;
        this.titleMaxLength = 60;
        this.titleActualLength = 0;
        this.subTitleMinLength = 20;
        this.subTitleMaxLength = 120;
        this.subTitleActualLength = 0;
        this.subjectMinLength = 6;
        this.subjectMaxLength = 120;
        this.subjectActualLength = 0;
        this.learningPointsMaxLength = 120;
        this.learningPointsMax = 6; // max number of course learning points allowed
        this.requirementsMaxLength = 120;
        this.requirementsMax = 6; // max number of course requirements allowed
        this.targetsMaxLength = 120;
        this.targetsMax = 6; // max number of course target students allowed
        this.errorMessages = {
            title: {
                minlength: `Your course title should be at least ${this.titleMinLength} characters.`,
                maxlength: `Your course title should be at less than ${this.titleMaxLength} characters.`,
                required: 'Please enter a course title.'
            },
            subtitle: {
                minlength: `Your course sub-title should be at least ${this.subTitleMinLength} characters.`,
                maxlength: `Your course sub-title should be at less than ${this.subTitleMaxLength} characters.`,
                required: 'Please enter a course sub-title.'
            },
            description: {
                required: 'Please enter a course description.'
            },
            language: {
                required: 'Please select a course language.'
            },
            category: {
                required: 'Please select the closest matching course category.'
            },
            level: {
                required: 'Please select an appropriate level for your course.'
            },
            subject: {
                minlength: `This summary should be at least ${this.subjectMinLength} characters.`,
                maxlength: `This summary should be at less than ${this.subjectMaxLength} characters.`,
                required: 'Please be specific about what your course is about.'
            },
            learningPoints: {
                maxlength: `Key learning points should be at less than ${this.learningPointsMaxLength} characters.`
            },
            requirements: {
                maxlength: `Requirements should be at less than ${this.requirementsMaxLength} characters.`
            },
            targets: {
                maxlength: `Target student descriptions should be at less than ${this.targetsMaxLength} characters.`
            }
        };
        this.objKeys = Object.keys;
        this.videoSources = [];
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.buildLandingForm();
            this.specialities = this.specialitiesService.getSpecialityList();
            this.languages = this.languagesService.getLanguagesJson();
        }
    }
    ngOnChanges() {
        if (this.course) {
            this.importCourseData();
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.viewLoaded = true;
        }, 100);
    }
    buildLandingForm() {
        this.landingForm = this.formBuilder.group({
            courseId: ['', [Validators.required]],
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
            subtitle: ['', [Validators.required, Validators.minLength(this.subTitleMinLength), Validators.maxLength(this.subTitleMaxLength)]],
            description: ['', [Validators.required]],
            language: ['', [Validators.required]],
            category: ['', [Validators.required]],
            level: ['', [Validators.required]],
            subject: ['', [Validators.required, Validators.minLength(this.subjectMinLength), Validators.maxLength(this.subjectMaxLength)]],
            mainImage: [null],
            promoVideo: [null],
            learningPoints: [this.formBuilder.array([])],
            requirements: [this.formBuilder.array([])],
            targets: [this.formBuilder.array([])]
        });
    }
    importCourseData() {
        this.landingForm.patchValue({
            courseId: this.course.courseId,
            title: this.course.title ? this.course.title : '',
            subtitle: this.course.subtitle ? this.course.subtitle : '',
            description: this.course.description ? this.course.description : '',
            language: this.course.language ? this.course.language : 'en',
            category: this.course.category ? this.course.category : '',
            level: this.course.level ? this.course.level : '',
            subject: this.course.subject ? this.course.subject : '',
            mainImage: this.course.image ? this.course.image : null,
            promoVideo: this.course.promoVideo ? this.course.promoVideo : null,
            // tslint:disable-next-line: max-line-length
            learningPoints: this.course.learningPoints ? this.loadLpoints() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.learningPointsMaxLength))], Validators.maxLength(this.learningPointsMax)),
            // tslint:disable-next-line: max-line-length
            requirements: this.course.requirements ? this.loadRequirements() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.requirementsMaxLength))], Validators.maxLength(this.requirementsMax)),
            // tslint:disable-next-line: max-line-length
            targets: this.course.targets ? this.loadTargets() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.targetsMaxLength))], Validators.maxLength(this.targetsMax))
        });
        if (this.course.promoVideo) {
            this.videoSources = []; // reset
            this.videoSources.push({
                src: this.course.promoVideo.downloadURL
            });
        }
        this.titleActualLength = this.landingF.title.value.length;
        this.subTitleActualLength = this.landingF.subtitle.value.length;
        this.subjectActualLength = this.landingF.subject.value.length;
    }
    loadLpoints() {
        const lpArray = this.formBuilder.array([], Validators.maxLength(this.learningPointsMax));
        this.course.learningPoints.forEach(lp => {
            lpArray.push(new FormControl(lp, Validators.maxLength(this.learningPointsMaxLength)));
        });
        return lpArray;
    }
    addLearningPoint() {
        const control = new FormControl('', Validators.maxLength(this.learningPointsMaxLength));
        this.landingF.learningPoints.value.controls.push(control);
    }
    loadRequirements() {
        const reqArray = this.formBuilder.array([], Validators.maxLength(this.requirementsMax));
        this.course.requirements.forEach(req => {
            reqArray.push(new FormControl(req, Validators.maxLength(this.requirementsMaxLength)));
        });
        return reqArray;
    }
    addRequirement() {
        const control = new FormControl('', Validators.maxLength(this.requirementsMaxLength));
        this.landingF.requirements.value.controls.push(control);
    }
    loadTargets() {
        const targetArray = this.formBuilder.array([], Validators.maxLength(this.targetsMax));
        this.course.targets.forEach(target => {
            targetArray.push(new FormControl(target, Validators.maxLength(this.targetsMaxLength)));
        });
        return targetArray;
    }
    addTarget() {
        const control = new FormControl('', Validators.maxLength(this.targetsMaxLength));
        this.landingF.targets.value.controls.push(control);
    }
    get landingF() {
        return this.landingForm.controls;
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
    onSubTitleInput(ev) {
        this.subTitleActualLength = ev.target.value.length;
    }
    onSubjectInput(ev) {
        this.subjectActualLength = ev.target.value.length;
    }
    onPictureUpload(event) {
        /*
          Triggered by the 'messageEvent' listener on the component template.
          The child 'picture-upload-component' will emit a chosen file when
          an image is chosen. We'll listen for that change here and grab the
          selected file for saving to storage & patching into our form control.
        */
        console.log(`Updating main course image with: ${event}`);
        this.landingForm.patchValue({
            mainImage: event
        });
        this.analyticsService.uploadCourseImage();
    }
    onPromoVideoUploadEvent(event) {
        // event should be a promo video object. We can now save this into the course object.
        console.log('Promo video uploaded event:', event);
        this.landingForm.patchValue({
            promoVideo: event
        });
        this.videoSources = []; // reset
        this.videoSources.push({
            src: event.downloadURL
        });
    }
    onLibraryItemSelect(event) {
        // TODO check file is a video!
        console.log('Item selected from library:', event);
        this.landingForm.patchValue({
            promoVideo: event
        });
        this.videoSources = []; // reset
        this.videoSources.push({
            src: event.downloadURL
        });
    }
    buildLpArray() {
        const arr = [];
        this.landingF.learningPoints.value.controls.forEach(control => {
            if (control.errors) {
                return;
            }
            arr.push(control.value);
        });
        if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
            return null;
        }
        return arr;
    }
    buildReqArray() {
        const arr = [];
        this.landingF.requirements.value.controls.forEach(control => {
            if (control.errors) {
                return;
            }
            arr.push(control.value);
        });
        if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
            return null;
        }
        return arr;
    }
    buildTargetArray() {
        const arr = [];
        this.landingF.targets.value.controls.forEach(control => {
            if (control.errors) {
                return;
            }
            arr.push(control.value);
        });
        if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
            return null;
        }
        return arr;
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.saving = true;
            // safety checks
            if (!this.landingF.title.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please add a course title.');
                this.saving = false;
                return;
            }
            if (!this.landingF.subtitle.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please add a course subtitle.');
                this.saving = false;
                return;
            }
            if (!this.landingF.description.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please add a course description.');
                this.saving = false;
                return;
            }
            if (!this.landingF.language.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please select a course language.');
                this.saving = false;
                return;
            }
            if (!this.landingF.category.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please select a course category.');
                this.saving = false;
                return;
            }
            if (!this.landingF.level.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please select a course level.');
                this.saving = false;
                return;
            }
            if (!this.landingF.subject.value) {
                this.alertService.alert('warning-message', 'Oops', 'Please add a primary subject.');
                this.saving = false;
                return;
            }
            // catch all fallback
            if (this.landingForm.invalid) {
                this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
                this.saving = false;
                return;
            }
            if (!this.userId) {
                this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save landing page data');
                this.saving = false;
                return;
            }
            // Handle image upload to storage if required.
            if (this.landingF.mainImage.value && !this.landingF.mainImage.value.includes(this.storageService.getStorageDomain())) {
                console.log(`Uploading unstored course photo to storage...`);
                const url = yield this.storageService.storeCourseImageUpdateDownloadUrl(this.userId, this.landingF.mainImage.value);
                console.log(`Photo stored successfully. Patching landing form with photo download URL: ${url}`);
                this.landingForm.patchValue({
                    mainImage: url
                });
            }
            // Merge landing form data into course data & save the course object
            this.course.title = this.landingF.title.value;
            this.course.subtitle = this.landingF.subtitle.value;
            this.course.description = this.landingF.description.value;
            this.course.language = this.landingF.language.value;
            this.course.category = this.landingF.category.value;
            this.course.level = this.landingF.level.value;
            this.course.subject = this.landingF.subject.value;
            this.course.image = this.landingF.mainImage.value;
            this.course.promoVideo = this.landingF.promoVideo.value;
            this.course.learningPoints = this.buildLpArray();
            this.course.requirements = this.buildReqArray();
            this.course.targets = this.buildTargetArray();
            // console.log(this.course);
            yield this.dataService.savePrivateCourse(this.userId, this.course);
            this.alertService.alert('auto-close', 'Success!', 'Course saved.');
            this.saving = false;
            this.analyticsService.editCourseLandingPage();
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseLandingPageComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseLandingPageComponent.prototype, "course", void 0);
CourseLandingPageComponent = __decorate([
    Component({
        selector: 'app-course-landing-page',
        templateUrl: './course-landing-page.component.html',
        styleUrls: ['./course-landing-page.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        DataService,
        AlertService,
        AnalyticsService,
        StorageService,
        CoachingSpecialitiesService,
        IsoLanguagesService])
], CourseLandingPageComponent);
export { CourseLandingPageComponent };
//# sourceMappingURL=course-landing-page.component.js.map