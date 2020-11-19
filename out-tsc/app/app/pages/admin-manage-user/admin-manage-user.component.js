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
import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
let AdminManageUserComponent = class AdminManageUserComponent {
    constructor(platformId, route, router, dataService, alertService, cloudFunctionsService) {
        this.platformId = platformId;
        this.route = route;
        this.router = router;
        this.dataService = dataService;
        this.alertService = alertService;
        this.cloudFunctionsService = cloudFunctionsService;
        this.purchasedCourses = []; // purchased courses as buyer
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.monitorRoute();
        }
    }
    monitorRoute() {
        this.route.params.subscribe(params => {
            if (params.targetUserUid) {
                this.targetUserUid = params.targetUserUid;
                console.log('Target user UID:', this.targetUserUid);
            }
            console.log('Loading user data...');
            this.loadUserData();
        });
    }
    loadUserData() {
        if (this.targetUserUid) {
            // Check user type
            this.subscriptions.add(this.dataService.getUserAccount(this.targetUserUid).subscribe(account => {
                if (account) {
                    this.account = account;
                    this.accountType = account.accountType;
                    this.newAccountType = account.accountType; // make a copy to allow update while preserving old data
                    if (this.accountType === 'coach') { // because only coaches can publish courses
                        // Check for created courses (as coach seller)
                        this.subscriptions.add(this.dataService.getPrivateCourses(this.targetUserUid).subscribe(courses => {
                            if (courses) {
                                this.courses = courses;
                                console.log('Courses:', courses);
                                const now = new Date();
                                const month = now.getMonth() + 1; // we dont store zero based. jan === 1
                                const year = now.getFullYear();
                                // Load stats
                                courses.forEach((c, i) => {
                                    const courseId = c.courseId;
                                    // Load course sales broken down by month
                                    this.subscriptions.add(this.dataService.getCourseSalesByMonth(this.targetUserUid, month, year, courseId).subscribe(sales => {
                                        if (sales) { // should be an array of custom free or paid course enrollment objects
                                            console.log(`Sales for course ${courseId}`, sales);
                                            // map a new array containing unique currencies from all sales in the month
                                            const uniqueCurrencies = [...new Set(sales.map(item => item.currency))];
                                            console.log('Unique currencies:', uniqueCurrencies);
                                            // build total sales for each unique currency
                                            const monthEarningsByCurrency = {};
                                            uniqueCurrencies.forEach(currencyString => {
                                                if (currencyString === 'free') { // exclude any free course 'sales'
                                                    return;
                                                }
                                                // calculate total sales amount for this currency
                                                let monthTotalInThisCurrency = 0;
                                                sales.forEach(saleObject => {
                                                    if (saleObject.currency === currencyString) {
                                                        // tslint:disable-next-line: max-line-length
                                                        monthTotalInThisCurrency += ((saleObject.amount - saleObject.amount_reversed) / 100); // convert into higher denominator (pence to pounds / cents to dollars)
                                                    }
                                                });
                                                // add the total for this currency into the overall totals for all currencies
                                                monthEarningsByCurrency[currencyString] = { monthTotalInThisCurrency };
                                            });
                                            // tslint:disable-next-line: max-line-length
                                            console.log(`Monthly earnings totals by currencies for course ${courseId}`, monthEarningsByCurrency);
                                            // add this data into the course object
                                            this.courses[i].monthlyEarnings = monthEarningsByCurrency;
                                        }
                                    }));
                                    // Load lifetime total sales for this course
                                    this.subscriptions.add(this.dataService.getLifetimeTotalCourseSales(this.targetUserUid, courseId).subscribe(ltSales => {
                                        console.log('Lifetime total course sales:', ltSales);
                                        if (ltSales) {
                                            c.lifetimeTotals = ltSales;
                                            let total = 0;
                                            Object.keys(ltSales).forEach(currency => {
                                                total += ltSales[currency].lifetimeTotalSales;
                                            });
                                            c.lifetimeTotalSales = total;
                                        }
                                    }));
                                });
                            }
                        }));
                    }
                    // Check for purchased courses. Coaches and regular users can purchase courses
                    this.subscriptions.add(this.dataService.getPurchasedCourses(this.targetUserUid).subscribe(courseIds => {
                        if (courseIds) {
                            console.log('Purchased Course Ids:', courseIds);
                            this.purchasedCourses = []; // reset
                            courseIds.forEach((o, index) => {
                                this.subscriptions.add(this.dataService.getPublicCourse(o.id).subscribe(course => {
                                    if (course) {
                                        this.purchasedCourses.push(course);
                                        this.calcCourseProgress(course, index);
                                    }
                                }));
                            });
                        }
                    }));
                }
            }));
        }
    }
    calcCourseProgress(course, index) {
        this.subscriptions.add(this.dataService.getPrivateCourseLecturesComplete(this.targetUserUid, course.courseId).subscribe(completedLectures => {
            const lecturesComplete = completedLectures.map(i => i.id);
            const pc = (lecturesComplete.length / course.lectures.length) * 100;
            this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
        }));
    }
    viewPublicUserProfile() {
        this.router.navigate(['/coach', this.targetUserUid]);
    }
    editUserProfile() {
        this.router.navigate(['/admin-edit-user-profile', this.targetUserUid]);
    }
    createUserCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.account.stripeUid) { // alert if no stripe account for info
                this.alertService.alert('info-message', 'Be Aware!', `This user has no Stripe account.`);
            }
            this.router.navigate(['my-courses', 'new-course'], { queryParams: { targetUser: this.targetUserUid } });
        });
    }
    viewUserCourse(courseId) {
        //
    }
    editUserCourse(courseId) {
        this.router.navigate(['/my-courses', courseId, 'content'], { queryParams: { targetUser: this.targetUserUid } });
    }
    saveUpdatedAccountType() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.targetUserUid) {
                this.alertService.alert('warning-message', 'Oops', 'Missing user ID.');
                return;
            }
            if (!this.accountType) {
                this.alertService.alert('warning-message', 'Oops', 'Missing account type.');
                return;
            }
            if (!this.newAccountType) {
                this.alertService.alert('warning-message', 'Oops', 'You must select an account type.');
                return;
            }
            console.log(`Updating user account type from ${this.accountType} to ${this.newAccountType}`);
            const res = yield this.cloudFunctionsService.adminChangeUserType(this.targetUserUid, this.accountType, this.newAccountType);
            this.changeAccountTypeModal.hide();
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    ViewChild('changeAccountTypeModal', { static: false }),
    __metadata("design:type", ModalDirective)
], AdminManageUserComponent.prototype, "changeAccountTypeModal", void 0);
AdminManageUserComponent = __decorate([
    Component({
        selector: 'app-admin-manage-user',
        templateUrl: './admin-manage-user.component.html',
        styleUrls: ['./admin-manage-user.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, ActivatedRoute,
        Router,
        DataService,
        AlertService,
        CloudFunctionsService])
], AdminManageUserComponent);
export { AdminManageUserComponent };
//# sourceMappingURL=admin-manage-user.component.js.map