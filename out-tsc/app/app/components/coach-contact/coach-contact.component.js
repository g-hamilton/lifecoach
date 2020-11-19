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
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { AlertService } from 'app/services/alert.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { Subscription } from 'rxjs';
let CoachContactComponent = class CoachContactComponent {
    constructor(platformId, formBuilder, analyticsService, authService, alertService, cloudFunctionsService, router) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.analyticsService = analyticsService;
        this.authService = authService;
        this.alertService = alertService;
        this.cloudFunctionsService = cloudFunctionsService;
        this.router = router;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
            this.buildContactForm();
            this.getUser();
        }
    }
    buildContactForm() {
        this.contactForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(1)]],
            lastName: ['', [Validators.required, Validators.minLength(1)]],
            email: [
                '',
                [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
            ],
            message: ['', [Validators.required]],
            recaptchaReactive: [null, [Validators.required]]
        });
    }
    get contactF() {
        return this.contactForm.controls;
    }
    recaptchaResolved(event) {
        console.log('reCaptchaEvent', event);
    }
    getUser() {
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe(user => {
            if (user) {
                this.userId = user.uid;
                // Remove the form controls we don't need when user is authorised
                this.contactForm.removeControl('firstName');
                this.contactForm.removeControl('lastName');
                this.contactForm.removeControl('email');
            }
        }));
    }
    postMsg() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cloudFunctionsService.postNewMessage(this.userId, this.coachUid, this.contactF.message.value, null);
        });
    }
    resetForm() {
        this.submitted = false;
        this.focusTouched = false;
        this.focus1Touched = false;
        this.focus2Touched = false;
        this.focus3Touched = false;
        this.contactForm.patchValue({
            firstName: '',
            lastName: '',
            email: '',
            message: '',
            recaptchaReactive: null
        });
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.contactForm.valid) {
                this.submitted = true;
                if (this.userId) {
                    this.analyticsService.contactCoach(this.coachUid);
                    // User is authenticated. Send message.
                    const res = yield this.postMsg();
                    if (res.success) {
                        this.submitted = false;
                        yield this.alertService.alert('success-message', 'Success!', `
          Message sent successfully! Visit 'My Dashboard > Messages' to see replies.
          If this Coach takes a little while to respond, we'll send you an email as soon as they reply.`);
                        this.resetForm();
                    }
                    else if (res.error) {
                        this.submitted = false;
                        yield this.alertService.alert('warning-message', 'Oops', `
          Something went wrong. Error: ${JSON.stringify(res.error)}`);
                    }
                }
                else {
                    // User is not authenticated. Require login or register to send message.
                    this.submitted = false;
                    this.loginRequired = true; // will trigger 'login-in-flow.component'
                    yield this.alertService.alert('info-message', 'Just a second...', `You must be logged in
        to contact coaches. If you're new to Lifecoach, signing up is totally FREE and only takes a second...`, 'OK');
                }
            }
            else {
                console.log('Invalid contact form!');
            }
        });
    }
    onUserAuth(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.result.user.uid) { // Now user is authenticated, continue sending message
                this.userId = event.result.user.uid;
                this.contactForm.patchValue({ recaptchaReactive: null });
                this.loginRequired = false;
                this.sendingMessage = true;
                this.submitted = true;
                const res = yield this.postMsg();
                if (res.success) { // message sent successfully
                    this.submitted = false;
                    yield this.alertService.alert('success-message', 'Success!', `
        Message sent successfully! Visit 'My Dashboard > Messages' to see replies.
        If this Coach takes a little while to respond, we'll send you an email as soon as they reply.`);
                    this.resetForm();
                    this.router.navigate(['/dashboard']);
                }
                else if (res.error) { // error sending message
                    this.submitted = false;
                    yield this.alertService.alert('warning-message', 'Oops', `
        Something went wrong. Error: ${JSON.stringify(res.error)}`);
                }
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CoachContactComponent.prototype, "coachUid", void 0);
CoachContactComponent = __decorate([
    Component({
        selector: 'app-coach-contact',
        templateUrl: './coach-contact.component.html',
        styleUrls: ['./coach-contact.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        AnalyticsService,
        AuthService,
        AlertService,
        CloudFunctionsService,
        Router])
], CoachContactComponent);
export { CoachContactComponent };
//# sourceMappingURL=coach-contact.component.js.map