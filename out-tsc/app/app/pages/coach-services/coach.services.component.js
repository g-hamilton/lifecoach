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
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
let CoachServicesComponent = class CoachServicesComponent {
    constructor(platformId, authService, dataService) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.getUserData();
        }
    }
    getUserData() {
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.subscriptions.add(this.dataService.getCoachServices(this.userId).subscribe(services => {
                    if (services) {
                        this.publishedServices = services;
                    }
                }));
            }
        }));
    }
    onAddCoachingService() {
        //
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
CoachServicesComponent = __decorate([
    Component({
        selector: 'app-coach-services',
        templateUrl: 'coach.services.component.html',
        styleUrls: ['./coach.services.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService])
], CoachServicesComponent);
export { CoachServicesComponent };
//# sourceMappingURL=coach.services.component.js.map