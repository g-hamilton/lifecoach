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
import * as algoliasearch from 'algoliasearch/lite';
const searchClient = algoliasearch('PXC7SZHHT9', '73c827f1b21571be69a545f2728f087c');
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
let AdminRefundsComponent = class AdminRefundsComponent {
    constructor(platformId, cloudFunctionsService, alertService) {
        this.platformId = platformId;
        this.cloudFunctionsService = cloudFunctionsService;
        this.alertService = alertService;
        this.aisConfig = {
            indexName: 'prod_REFUNDS',
            searchClient
        };
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }
    timestampToDate(timestamp) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }
    approveRefund(refundRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(refundRequest);
            if (refundRequest) {
                const res = yield this.cloudFunctionsService.approveRefund(refundRequest);
                console.log(res);
                if (res.error) {
                    this.alertService.alert('warning-message', 'Oops', JSON.stringify(res.error));
                    return;
                }
                this.alertService.alert('success-message', 'Success!', 'Refund approved.');
            }
            else {
                console.log('No refund request argument!');
            }
        });
    }
};
AdminRefundsComponent = __decorate([
    Component({
        selector: 'app-admin-refunds',
        templateUrl: 'admin.refunds.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, CloudFunctionsService,
        AlertService])
], AdminRefundsComponent);
export { AdminRefundsComponent };
//# sourceMappingURL=admin.refunds.component.js.map