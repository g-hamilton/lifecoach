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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AlertService } from '../../services/alert.service';
import { DOCUMENT } from '@angular/common';
let LoginComponent = class LoginComponent {
    constructor(document, platformId, formBuilder, authService, router, analyticsService, alertService, titleService, metaTagService) {
        this.document = document;
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.analyticsService = analyticsService;
        this.alertService = alertService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.login = false;
        this.focusTouched = false;
        this.focusTouched1 = false;
    }
    ngOnInit() {
        this.titleService.setTitle('Login to Lifecoach');
        this.metaTagService.updateTag({ name: 'description', content: 'Log into your Lifecoach account' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
        // Build the login form
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }
    ngOnDestroy() {
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
    }
    get loginF() {
        return this.loginForm.controls;
    }
    forgotPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.alertService.alert('input-field', 'Forgot your password?', 'No problem! Simply request a password reset email...');
            if (res.complete && res.data) {
                const email = res.data.toLowerCase().trim();
                const response = yield this.authService.resetPassword(email);
                console.log(response);
                if (response.result !== 'error') {
                    this.alertService.alert('success-message', 'Success!', `Your password reset email is on the way. Please check your inbox.`);
                }
                else {
                    console.log(response.msg);
                    if (response.msg === 'auth/user-not-found') {
                        this.alertService.alert('warning-message', 'Oops!', 'That email address has not been found. Please check it and try again.');
                    }
                    else {
                        this.alertService.alert('warning-message', 'Oops!', 'Something went wrong. Please contact hello@lifecoach.io for help.');
                    }
                }
            }
        });
    }
    onLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            // Log the user in
            if (this.loginForm.valid) {
                this.login = true;
                const account = {
                    accountEmail: this.loginF.email.value,
                    password: this.loginF.password.value,
                    accountType: null
                };
                const res = yield this.authService.signInWithEmailAndPassword(account);
                if (!res.error) {
                    // Login successful.
                    this.router.navigate(['/dashboard']);
                    this.alertService.alert('auto-close', 'Login Successful', 'Welcome back!');
                    this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
                }
                else {
                    // Login error.
                    this.login = false;
                    // Check auth provider error codes.
                    if (res.error.code === 'auth/wrong-password') {
                        this.alertService.alert('warning-message', 'Oops', 'Incorrect password. Please try again.');
                    }
                    else if (res.error.code === 'auth/user-not-found') {
                        // tslint:disable-next-line: max-line-length
                        this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
                    }
                    else {
                        // Fall back for unknown / no error code
                        // tslint:disable-next-line: max-line-length
                        this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please try again or contact hello@lifecoach.io for assistance.');
                    }
                }
            }
            else {
                this.alertService.alert('warning-message', 'Almost Done!', 'Please complete all required fields.');
            }
        });
    }
};
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: 'login.component.html'
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, FormBuilder,
        AuthService,
        Router,
        AnalyticsService,
        AlertService,
        Title,
        Meta])
], LoginComponent);
export { LoginComponent };
//# sourceMappingURL=login.component.js.map