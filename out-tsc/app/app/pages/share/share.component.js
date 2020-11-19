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
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { Subscription } from 'rxjs';
let ShareComponent = class ShareComponent {
    constructor(platformId, authService, dataService, analyticsService, cloudFunctionsService) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.analyticsService = analyticsService;
        this.cloudFunctionsService = cloudFunctionsService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.analyticsService.pageView();
            // Get user auth data
            this.subscriptions.add(this.authService.getAuthUser()
                .subscribe(user => {
                if (user) {
                    this.userId = user.uid;
                    this.subscriptions.add(this.dataService.getCoachProfile(this.userId).subscribe(profile => {
                        if (profile) { // a coach profile with shortUrl exists for this user
                            this.profile = profile;
                        }
                    }));
                }
            }));
        }
    }
    generateSmartlink() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.generatingSmartlink) {
                this.generatingSmartlink = true;
                if (!this.profile.profileUrl) { // catch the case where profileUrl is not defined
                    this.profile.profileUrl = `https://lifecoach.io/coach/${this.userId}`;
                    this.dataService.saveCoachProfile(this.userId, this.profile);
                }
                const res = yield this.cloudFunctionsService.generateShortUrl(this.userId, this.profile.profileUrl);
                if (!res.error) {
                    // success
                    console.log(res);
                }
                else {
                    // alert res.error.
                }
                this.generatingSmartlink = false;
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
ShareComponent = __decorate([
    Component({
        selector: 'app-share',
        templateUrl: 'share.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        AnalyticsService,
        CloudFunctionsService])
], ShareComponent);
export { ShareComponent };
//# sourceMappingURL=share.component.js.map