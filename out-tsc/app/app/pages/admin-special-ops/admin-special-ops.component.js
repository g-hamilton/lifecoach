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
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
let AdminSpecialOpsComponent = class AdminSpecialOpsComponent {
    constructor(platformId, cloudFunctionsService, alertService) {
        this.platformId = platformId;
        this.cloudFunctionsService = cloudFunctionsService;
        this.alertService = alertService;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }
    triggerServerSideProfileUpdateInSequence() {
        return __awaiter(this, void 0, void 0, function* () {
            this.runningProfileUpdate = true;
            const res = yield this.cloudFunctionsService.adminTriggerAllProfilesUpdateInSequence();
            if (res.success) {
                this.alertService.alert('success-message', 'Success!', res.message);
            }
            else if (res.error) {
                this.alertService.alert('warning-message', 'Oops!', res.error);
            }
            this.runningProfileUpdate = false;
        });
    }
};
AdminSpecialOpsComponent = __decorate([
    Component({
        selector: 'app-admin-special-ops',
        templateUrl: 'admin-special-ops.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, CloudFunctionsService,
        AlertService])
], AdminSpecialOpsComponent);
export { AdminSpecialOpsComponent };
//# sourceMappingURL=admin-special-ops.component.js.map