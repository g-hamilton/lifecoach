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
import { Component, Inject, PLATFORM_ID, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AnalyticsService } from 'app/services/analytics.service';
let CourseSectionComponent = class CourseSectionComponent {
    constructor(platformId, formBuilder, dataService, route, router, analyticsService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.route = route;
        this.router = router;
        this.analyticsService = analyticsService;
        this.titleMinLength = 6;
        this.titleMaxLength = 60;
        this.titleActualLength = 0;
        this.errorMessages = {
            title: {
                minlength: `Section titles should be at least ${this.titleMinLength} characters.`,
                maxlength: `Section titles should be at less than ${this.titleMaxLength} characters.`
            }
        };
        this.objKeys = Object.keys;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.route.queryParams.subscribe(qP => {
                if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
                    this.targetUserUid = qP.targetUser;
                }
            });
            this.buildSectionForm();
        }
    }
    ngOnChanges() {
        if (this.course && this.activatedSectionId) {
            this.loadSection();
        }
    }
    buildSectionForm() {
        this.sectionForm = this.formBuilder.group({
            id: ['', [Validators.required]],
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
            expanded: [false],
            lectures: [[]]
        });
    }
    get sectionF() {
        return this.sectionForm.controls;
    }
    loadSection() {
        const matches = this.course.sections.filter(item => item.id === this.activatedSectionId);
        const section = matches[0]; // should only be 1 matching section id
        this.sectionForm.patchValue({
            id: section.id,
            title: section.title,
            expanded: section.expanded ? section.expanded : false,
            lectures: section.lectures ? section.lectures : []
        });
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
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            // If this is a new section
            if (this.isNewSection && !this.sectionF.id.value) {
                const sectionId = Math.random().toString(36).substr(2, 9); // generate semi-random id
                this.sectionForm.patchValue({ id: sectionId }); // update form with new id
                this.sectionForm.patchValue({ expanded: true }); // auto expand new sections
            }
            // Safety checks
            if (this.sectionForm.invalid) {
                console.log('Invalid form', this.sectionForm.errors);
                return;
            }
            if (!this.course) {
                console.log('No course to associate section with!');
                return;
            }
            // Ensure sections array exists
            if (!this.course.sections) {
                this.course.sections = [];
            }
            // If we're creating a new section
            if (this.isNewSection) {
                // Add the section into the course object
                this.course.sections.push(this.sectionForm.value);
                this.analyticsService.createCourseSection();
            }
            // If we're editing an existing section
            if (this.activatedSectionId) {
                const i = this.course.sections.findIndex(item => item.id === this.activatedSectionId);
                if (i !== -1) {
                    this.course.sections[i] = this.sectionForm.value;
                }
                this.analyticsService.editCourseSection();
            }
            // Save the course object
            const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
            yield this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);
            // Navigate to relevant section url
            this.router.navigate(['my-courses', this.course.courseId, 'content', 'section', this.sectionF.id.value], { queryParams: { targetUser: this.targetUserUid } });
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], CourseSectionComponent.prototype, "isNewSection", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseSectionComponent.prototype, "activatedSectionId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseSectionComponent.prototype, "course", void 0);
CourseSectionComponent = __decorate([
    Component({
        selector: 'app-course-section',
        templateUrl: './course-section.component.html',
        styleUrls: ['./course-section.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        DataService,
        ActivatedRoute,
        Router,
        AnalyticsService])
], CourseSectionComponent);
export { CourseSectionComponent };
//# sourceMappingURL=course-section.component.js.map