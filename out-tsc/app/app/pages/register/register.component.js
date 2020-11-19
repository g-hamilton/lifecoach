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
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from '../../services/alert.service';
import { AnalyticsService } from '../../services/analytics.service';
let RegisterComponent = class RegisterComponent {
    constructor(formBuilder, authService, toastService, alertService, analyticsService, router, route, titleService, metaTagService, document, platformId) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.toastService = toastService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.router = router;
        this.route = route;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.document = document;
        this.platformId = platformId;
        this.register = false;
        this.focusTouched = false;
        this.focusTouched1 = false;
        this.focusTouched2 = false;
        this.focusTouched3 = false;
        this.coachPlans = [
            { id: '001', itemName: 'Free', price: 0 },
            { id: '002', itemName: 'Spark', price: 9 },
            { id: '003', itemName: 'Flame', price: 29 },
            { id: '004', itemName: 'Blaze', price: 49 }
        ]; // Not using these yet but if a selector is needed they're ready!
    }
    ngOnInit() {
        // console.log(this.registerF, 'register', this.registerF.accountType.value);
        this.titleService.setTitle('Signup to Lifecoach');
        this.metaTagService.updateTag({ name: 'description', content: 'Join the fastest growing life coaching community' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('register-page');
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
        // Build the register form
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            accountType: [null, [Validators.required]],
            termsAccepted: [false, Validators.pattern('true')]
        });
        // Check activated route params for user type to register
        this.route.params.subscribe(params => {
            console.log('Route params:', params);
            this.registerForm.patchValue({
                accountType: params.type // update the form with account type
            });
        });
    }
    ngOnDestroy() {
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('register-page');
    }
    get registerF() {
        return this.registerForm.controls;
    }
    onRegister() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check form validity
            if (this.registerForm.valid) {
                this.register = true;
                // Create new account object
                const newUserAccount = {
                    accountEmail: this.registerF.email.value,
                    password: this.registerF.password.value,
                    // accountType: 'admin', // Uncomment and comment next-line to create admin acc
                    accountType: this.registerF.accountType.value,
                    firstName: this.registerF.firstName.value,
                    lastName: this.registerF.lastName.value
                };
                const firstName = this.registerF.firstName.value;
                // Check account type & attempt registration
                const response = yield this.authService.createUserWithEmailAndPassword(newUserAccount);
                if (!response.error) {
                    // Success
                    this.register = false;
                    console.log('Registration successful:', response.result.user);
                    this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
                    yield this.alertService.alert('success-message', 'Success!', `
        Welcome to Lifecoach ${firstName}! Let's visit your new dashboard...`);
                    this.router.navigate(['/dashboard'], { state: { uid: response.result.user.uid } });
                }
                else {
                    // Error
                    this.register = false;
                    if (response.error.code === 'auth/email-already-in-use') {
                        this.alertService.alert('warning-message', 'Oops', 'That email is already registered. Please log in.');
                    }
                    else if (response.error.code === 'auth/invalid-email') {
                        this.alertService.alert('warning-message', 'Oops', 'Invalid email address. Please try a different email.');
                    }
                    else if (response.error.code === 'auth/weak-password') {
                        this.alertService.alert('warning-message', 'Oops', 'Password is too weak. Please use a stronger password.');
                    }
                    else {
                        this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please contact hello@lifecoach.io for help');
                    }
                }
            }
            else {
                this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
            }
        });
    }
};
RegisterComponent = __decorate([
    Component({
        selector: 'app-register',
        templateUrl: 'register.component.html'
    }),
    __param(9, Inject(DOCUMENT)),
    __param(10, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [FormBuilder,
        AuthService,
        ToastService,
        AlertService,
        AnalyticsService,
        Router,
        ActivatedRoute,
        Title,
        Meta, Object, Object])
], RegisterComponent);
export { RegisterComponent };
//# sourceMappingURL=register.component.js.map