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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import * as algoliasearch from 'algoliasearch/lite';
import { DataService } from '../../services/data.service';
const searchClient = algoliasearch('PXC7SZHHT9', '73c827f1b21571be69a545f2728f087c');
let AdminUsersComponent = class AdminUsersComponent {
    constructor(document, platformId, dataService, router) {
        this.document = document;
        this.platformId = platformId;
        this.dataService = dataService;
        this.router = router;
        this.aisConfig = {
            indexName: 'prod_USERS',
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
    viewPublicProfile(uid) {
        this.router.navigate(['coach', uid]);
    }
    manageUser(uid) {
        this.router.navigate(['admin-manage-user', uid]);
    }
};
AdminUsersComponent = __decorate([
    Component({
        selector: 'app-admin-users',
        templateUrl: 'admin.users.component.html'
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, DataService,
        Router])
], AdminUsersComponent);
export { AdminUsersComponent };
//# sourceMappingURL=admin.users.component.js.map