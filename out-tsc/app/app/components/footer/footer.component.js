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
import { AuthService } from 'app/services/auth.service';
import { SsoService } from 'app/services/sso.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
let FooterComponent = class FooterComponent {
    constructor(platformId, authService, ssoService) {
        this.platformId = platformId;
        this.authService = authService;
        this.ssoService = ssoService;
        this.myDate = new Date();
        this.feedbackUrl = 'https://lifecoach.nolt.io';
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadUserData();
        }
    }
    loadUserData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get user ID
            const tempAuthSub = this.authService.getAuthUser()
                .subscribe(user => {
                if (user) { // User is authorised
                    this.uid = user.uid; // <-- Ensure we get an authorised uid before calling for user data
                    // Get a SSO token for this user
                    this.getUserSSOToken();
                }
            });
            this.subscriptions.add(tempAuthSub);
        });
    }
    getUserSSOToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.ssoService.getSsoToken(this.uid);
            if (token) {
                this.feedbackUrl = `https://lifecoach.nolt.io/sso/${token}`;
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
FooterComponent = __decorate([
    Component({
        selector: 'app-footer',
        templateUrl: './footer.component.html',
        styleUrls: ['./footer.component.css']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        SsoService])
], FooterComponent);
export { FooterComponent };
//# sourceMappingURL=footer.component.js.map