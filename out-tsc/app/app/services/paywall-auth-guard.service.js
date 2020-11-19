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
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from './data.service';
import { first } from 'rxjs/operators';
let PaywallAuthGuardService = class PaywallAuthGuardService {
    constructor(authService, router, dataService, route, platformId) {
        this.authService = authService;
        this.router = router;
        this.dataService = dataService;
        this.route = route;
        this.platformId = platformId;
    }
    canActivate(route) {
        if (isPlatformBrowser(this.platformId)) {
            return new Promise(resolve => {
                const cId = route.paramMap.get('courseId'); // retrieve the course ID we're trying to navigate to
                // console.log(cId);
                // Check if user authorised
                this.authService.getAuthUser().pipe(first())
                    .subscribe((user) => __awaiter(this, void 0, void 0, function* () {
                    if (!user && isPlatformBrowser(this.platformId)) { // user unauthorised & browser
                        console.log('Route guard unauthorised!');
                        this.router.navigate(['login']);
                        resolve(false);
                        return;
                    }
                    if (user) { // user authorised
                        // check user token for permissions
                        const res = yield user.getIdTokenResult(true);
                        // console.log(res.claims);
                        if (res.claims.admin || res.claims[cId]) { // user is admin or has purchased course
                            console.log('User is authorised to continue...');
                            resolve(true);
                            return;
                        }
                        // check user created courses
                        this.dataService.getPrivateCourses(user.uid).pipe(first()).subscribe(courses => {
                            if (courses) { // user has created courses
                                const match = courses.findIndex(i => i.courseId === cId);
                                if (match === -1) { // user has not created this course
                                    alert('Unauthorised!');
                                    console.log('Route guard unauthorised!');
                                    resolve(false);
                                    return;
                                }
                                resolve(true); // user has created this course
                                return;
                            }
                            else { // user has no courses
                                alert('Unauthorised!');
                                console.log('Route guard unauthorised!');
                                resolve(false);
                                return;
                            }
                        });
                    }
                }));
            });
        }
        else {
            return new Promise(resolve => {
                resolve(true);
            });
        }
    }
};
PaywallAuthGuardService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(4, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [AuthService,
        Router,
        DataService,
        ActivatedRoute, Object])
], PaywallAuthGuardService);
export { PaywallAuthGuardService };
//# sourceMappingURL=paywall-auth-guard.service.js.map