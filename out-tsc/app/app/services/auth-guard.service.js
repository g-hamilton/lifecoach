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
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { first } from 'rxjs/operators';
let AuthGuardService = class AuthGuardService {
    constructor(authService, router, platformId) {
        this.authService = authService;
        this.router = router;
        this.platformId = platformId;
    }
    canActivate() {
        return new Promise(resolve => {
            this.authService.getAuthUser().pipe(first())
                .subscribe(user => {
                if (!user && isPlatformBrowser(this.platformId)) {
                    this.router.navigate(['login']);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }
};
AuthGuardService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(2, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [AuthService,
        Router, Object])
], AuthGuardService);
export { AuthGuardService };
//# sourceMappingURL=auth-guard.service.js.map