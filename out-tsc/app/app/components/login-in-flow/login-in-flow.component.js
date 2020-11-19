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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ToastService } from '../../services/toast.service';
import { AlertService } from 'app/services/alert.service';
let LoginInFlowComponent = class LoginInFlowComponent {
    constructor(formBuilder, authService, analyticsService, toastService, alertService) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.analyticsService = analyticsService;
        this.toastService = toastService;
        this.alertService = alertService;
        this.loginEvent = new EventEmitter();
        this.registerEvent = new EventEmitter();
    }
    ngOnInit() {
        this.buildLoginForm();
        this.buildRegisterForm();
    }
    buildLoginForm() {
        this.loginForm = this.formBuilder.group({
            email: [this.email ? this.email : '', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }
    buildRegisterForm() {
        this.registerForm = this.formBuilder.group({
            firstName: [this.firstName ? this.firstName : '', [Validators.required]],
            lastName: [this.lastName ? this.lastName : '', [Validators.required]],
            email: [this.email ? this.email : '', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            termsAccepted: [false, Validators.pattern('true')]
        });
    }
    get loginF() {
        return this.loginForm.controls;
    }
    onLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loginForm.valid) {
                this.login = true;
                const account = {
                    accountEmail: this.loginF.email.value,
                    password: this.loginF.password.value,
                    accountType: null
                };
                const res = yield this.authService.signInWithEmailAndPassword(account);
                if (!res.error) { // successful login
                    this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
                    this.loginEvent.emit(res); // emit the login response
                }
                else { // error logging in
                    this.login = false;
                    // Check auth provider error codes.
                    if (res.error.code === 'auth/wrong-password') {
                        this.toastService.showToast('Oops! Incorrect password. Please try again.', 0, 'danger');
                    }
                    else if (res.error.code === 'auth/user-not-found') {
                        this.toastService.showToast('Oops! Email address not found. Please check your login email address is correct.', 0, 'danger');
                    }
                    else {
                        // Fall back for unknown / no error code
                        // tslint:disable-next-line: max-line-length
                        this.toastService.showToast('Oops! Something went wrong. Please try again or contact hello@lifecoach.io for assistance.', 0, 'danger');
                    }
                }
            }
            else {
                this.toastService.showToast('Please complete all required fields.', 0, 'danger');
            }
        });
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
                    accountType: 'regular',
                    firstName: this.registerF.firstName.value,
                    lastName: this.registerF.lastName.value
                };
                // Attempt registration
                const response = yield this.authService.createUserWithEmailAndPassword(newUserAccount);
                if (!response.error) { // Successful registration
                    this.register = false;
                    this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
                    this.registerEvent.emit(response);
                }
                else { // Registration error
                    this.register = false;
                    if (response.error.code === 'auth/email-already-in-use') {
                        this.toastService.showToast('Oops! That email is already registered. Please log in.', 0, 'danger');
                    }
                    else if (response.error.code === 'auth/invalid-email') {
                        this.toastService.showToast('Oops! Invalid email address. Please try a different email.', 0, 'danger');
                    }
                    else if (response.error.code === 'auth/weak-password') {
                        this.toastService.showToast('Oops! Password is too weak. Please use a stronger password.', 0, 'danger');
                    }
                    else {
                        this.toastService.showToast('Oops! Something went wrong. Please contact hello@lifecoach.io for help', 0, 'danger');
                    }
                }
            }
            else {
                this.toastService.showToast('Please complete all required fields.', 5000, 'danger');
            }
        });
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
};
__decorate([
    Input(),
    __metadata("design:type", String)
], LoginInFlowComponent.prototype, "email", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], LoginInFlowComponent.prototype, "firstName", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], LoginInFlowComponent.prototype, "lastName", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], LoginInFlowComponent.prototype, "showAlert", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], LoginInFlowComponent.prototype, "alertText", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], LoginInFlowComponent.prototype, "loginEvent", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], LoginInFlowComponent.prototype, "registerEvent", void 0);
LoginInFlowComponent = __decorate([
    Component({
        selector: 'app-login-in-flow',
        templateUrl: './login-in-flow.component.html',
        styleUrls: ['./login-in-flow.component.scss']
    }),
    __metadata("design:paramtypes", [FormBuilder,
        AuthService,
        AnalyticsService,
        ToastService,
        AlertService])
], LoginInFlowComponent);
export { LoginInFlowComponent };
//# sourceMappingURL=login-in-flow.component.js.map