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
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
let NewCourseComponent = class NewCourseComponent {
    constructor(platformId, formBuilder, router, alertService, dataService) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.router = router;
        this.alertService = alertService;
        this.dataService = dataService;
        this.titleMinLength = 10;
        this.titleMaxLength = 60;
        this.titleActualLength = 0;
        this.errorMessages = {
            title: {
                minlength: `Your title should be at least ${this.titleMinLength} characters.`,
                maxlength: `Your title should be at less than ${this.titleMaxLength} characters.`
            }
        };
        this.objKeys = Object.keys;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.buildCourseForm();
        }
    }
    buildCourseForm() {
        this.newCourseForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]]
        });
    }
    get courseF() {
        return this.newCourseForm.controls;
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
            // Safety checks
            if (this.newCourseForm.invalid) {
                this.alertService.alert('warning-message', 'Oops', 'Invalid form.');
                return;
            }
            if (!this.userId) {
                this.alertService.alert('warning-message', 'Oops', 'Missing UID.');
                return;
            }
            if (!this.account) {
                this.alertService.alert('warning-message', 'Oops', 'Missing account data.');
                return;
            }
            // Prepare the new course object
            const courseId = Math.random().toString(36).substr(2, 9); // generate semi-random id
            const newCourse = {
                courseId,
                sellerUid: this.userId,
                stripeId: this.account.stripeUid ? this.account.stripeUid : null,
                title: this.courseF.title.value,
                sections: [],
                lectures: []
            };
            // Save the new course to the db
            yield this.dataService.savePrivateCourse(this.userId, newCourse);
            // Navigate to continue
            this.router.navigate(['/my-courses', courseId, 'content', 'section', 'new'], { queryParams: { targetUser: this.userId } });
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], NewCourseComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], NewCourseComponent.prototype, "account", void 0);
NewCourseComponent = __decorate([
    Component({
        selector: 'app-new-course',
        templateUrl: './new-course.component.html',
        styleUrls: ['./new-course.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        Router,
        AlertService,
        DataService])
], NewCourseComponent);
export { NewCourseComponent };
//# sourceMappingURL=new-course.component.js.map