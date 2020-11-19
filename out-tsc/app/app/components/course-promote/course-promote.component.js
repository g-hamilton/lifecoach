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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { isPlatformBrowser } from '@angular/common';
let CoursePromoteComponent = class CoursePromoteComponent {
    constructor(platformId, formBuilder, dataService, alertService, analyticsService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.dataService = dataService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.buildPromoteForm();
        }
    }
    ngOnChanges() {
        if (this.userId && this.course) {
            const baseUrl = `https://lifecoach.io/course/${this.course.courseId}/`;
            const queryparams = `?referralCode=${this.userId}`;
            this.promoteForm.patchValue({ referralCode: `${baseUrl}${queryparams}` });
        }
    }
    buildPromoteForm() {
        this.promoteForm = this.formBuilder.group({
            referralCode: ['', [Validators.required]]
        });
    }
    get promoteF() {
        return this.promoteForm.controls;
    }
    copyReferralCode(element) {
        // Copy to the clipboard.
        // Note: Don't try this in SSR environment unless injecting document!
        // console.log('copy clicked', element);
        element.select();
        document.execCommand('copy');
        element.setSelectionRange(0, 0);
        this.alertService.alert('auto-close', 'Copied!', 'Link copied to clipboard.');
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CoursePromoteComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CoursePromoteComponent.prototype, "course", void 0);
CoursePromoteComponent = __decorate([
    Component({
        selector: 'app-course-promote',
        templateUrl: './course-promote.component.html',
        styleUrls: ['./course-promote.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        DataService,
        AlertService,
        AnalyticsService])
], CoursePromoteComponent);
export { CoursePromoteComponent };
//# sourceMappingURL=course-promote.component.js.map