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
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Subscription } from 'rxjs';
let ReferFriendComponent = class ReferFriendComponent {
    constructor(formBuilder, router, authService, dataService, alertService, cloudFunctionsService, analyticsService, platformId) {
        this.formBuilder = formBuilder;
        this.router = router;
        this.authService = authService;
        this.dataService = dataService;
        this.alertService = alertService;
        this.cloudFunctionsService = cloudFunctionsService;
        this.analyticsService = analyticsService;
        this.platformId = platformId;
        this.submitted = false;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
        // Build the form
        this.buildAccountForm();
        // Update the form with saved user data
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.subscriptions.add(this.dataService.getUserAccount(user.uid)
                    .subscribe(account => {
                    if (account) {
                        this.updateAccountForm(account);
                    }
                }));
            }
        }));
    }
    buildAccountForm() {
        this.accountForm = this.formBuilder.group({
            dateCreated: [''],
            accountType: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            accountEmail: new FormControl({ value: '', disabled: true })
        });
    }
    updateAccountForm(account) {
        this.accountForm.patchValue({
            dateCreated: account.dateCreated,
            accountType: account.accountType,
            firstName: account.firstName,
            lastName: account.lastName,
            accountEmail: account.accountEmail
        });
    }
    get accountF() {
        return this.accountForm.controls;
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (true) {
                this.submitted = true;
                const aT = this.accountF.accountType.value;
                const eM = this.accountF.accountEmail.value;
                const fN = this.accountF.firstName.value;
                const lN = this.accountF.lastName.value;
                this.submitted = false;
                this.alertService.alert('success-message', 'Success!', '.');
                // this.analyticsService.referFriend();
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
ReferFriendComponent = __decorate([
    Component({
        selector: 'app-refer-friend',
        templateUrl: 'referfriend.component.html'
    }),
    __param(7, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [FormBuilder,
        Router,
        AuthService,
        DataService,
        AlertService,
        CloudFunctionsService,
        AnalyticsService, Object])
], ReferFriendComponent);
export { ReferFriendComponent };
//# sourceMappingURL=referfriend.component.js.map