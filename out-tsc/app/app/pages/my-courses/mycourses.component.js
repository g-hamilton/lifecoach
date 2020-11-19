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
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let MyCoursesComponent = class MyCoursesComponent {
    constructor(platformId, authService, dataService, currenciesService, router, alertService, analyticsService) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.currenciesService = currenciesService;
        this.router = router;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.purchasedCourses = []; // purchased courses as buyer
        this.objKeys = Object.keys;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.currencies = this.currenciesService.getCurrencies();
            this.loadUserData();
        }
    }
    loadUserData() {
        this.subscriptions.add(this.authService.getAuthUser().subscribe((user) => __awaiter(this, void 0, void 0, function* () {
            if (user) {
                console.log('THIS IS USER', user);
                this.userId = user.uid;
                const token = yield user.getIdTokenResult(true);
                console.log('Claims:', token.claims);
                // Check user type
                this.subscriptions.add(this.dataService.getUserAccount(this.userId).subscribe(account => {
                    if (account) {
                        this.account = account;
                        this.accountType = account.accountType;
                        if (this.accountType === 'coach') { // because only coaches can publish courses
                            // Check for created courses (as coach seller)
                            this.subscriptions.add(this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
                                if (courses) {
                                    this.publishedCourses = courses;
                                    console.log('Published Courses:', courses);
                                    const now = new Date();
                                    const month = now.getMonth() + 1; // we dont store zero based. jan === 1
                                    const year = now.getFullYear();
                                    // Load stats
                                    courses.forEach((c, i) => {
                                        const courseId = c.courseId;
                                        // Load course sales broken down by month
                                        this.subscriptions.add(this.dataService.getCourseSalesByMonth(this.userId, month, year, courseId).subscribe(sales => {
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
                                                this.publishedCourses[i].monthlyEarnings = monthEarningsByCurrency;
                                            }
                                        }));
                                        // Load lifetime total sales for this course
                                        this.subscriptions.add(this.dataService.getLifetimeTotalCourseSales(this.userId, courseId).subscribe(ltSales => {
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
                        this.subscriptions.add(this.dataService.getPurchasedCourses(this.userId).subscribe(courseIds => {
                            if (courseIds) {
                                console.log('Enrolled In Course Ids:', courseIds);
                                this.purchasedCourses = []; // reset
                                courseIds.forEach((o, index) => {
                                    this.subscriptions.add(this.dataService.getUnlockedPublicCourse(o.id).subscribe(course => {
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
        })));
    }
    browseCourses() {
        this.analyticsService.clickBrowseCourses();
        this.router.navigate(['courses']);
    }
    createCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            this.analyticsService.clickCreateCourse();
            this.router.navigate(['my-courses', 'new-course']); // navigate to new course page
        });
    }
    calcCourseProgress(course, index) {
        this.subscriptions.add(this.dataService.getPrivateCourseLecturesComplete(this.userId, course.courseId).subscribe(completedLectures => {
            const lecturesComplete = completedLectures.map(i => i.id);
            const pc = (lecturesComplete.length / course.lectures.length) * 100;
            this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
        }));
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
MyCoursesComponent = __decorate([
    Component({
        selector: 'app-my-courses',
        templateUrl: 'mycourses.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        CurrenciesService,
        Router,
        AlertService,
        AnalyticsService])
], MyCoursesComponent);
export { MyCoursesComponent };
//# sourceMappingURL=mycourses.component.js.map