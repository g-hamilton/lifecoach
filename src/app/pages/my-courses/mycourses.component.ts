import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AlertService } from 'app/services/alert.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
    selector: 'app-my-courses',
    templateUrl: 'mycourses.component.html'
})
export class MyCoursesComponent implements OnInit {

    public browser: boolean;
    private userId: string;
    public account: UserAccount;
    public accountType: 'regular' | 'coach' | 'admin';
    public purchasedCourses = [] as CoachingCourse[]; // purchased courses as buyer
    public publishedCourses: CoachingCourse[]; // courses created as coach seller
    public currencies: any;
    public objKeys = Object.keys;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private authService: AuthService,
        private dataService: DataService,
        private currenciesService: CurrenciesService,
        private router: Router,
        private alertService: AlertService,
        private analyticsService: AnalyticsService
    ) { }

    ngOnInit() {

        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.currencies = this.currenciesService.getCurrencies();
            this.loadUserData();
        }
    }

    loadUserData() {
        this.authService.getAuthUser().subscribe(async user => {
            if (user) {
                this.userId = user.uid;
                const token = await user.getIdTokenResult(true);
                console.log('Claims:', token.claims);

                // Check user type
                this.dataService.getUserAccount(this.userId).subscribe(account => {
                    if (account) {
                        this.account = account;
                        this.accountType = account.accountType;

                        if (this.accountType === 'coach') { // because only coaches can publish courses
                            // Check for created courses (as coach seller)
                            this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
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
                                        this.dataService.getCourseSalesByMonth(this.userId, month, year, courseId).subscribe(sales => {
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
                                                            monthTotalInThisCurrency += ((saleObject.amount - saleObject.amount_reversed) / 100 ); // convert into higher denominator (pence to pounds / cents to dollars)
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
                                        });
                                        // Load lifetime total sales for this course
                                        this.dataService.getLifetimeTotalCourseSales(this.userId, courseId).subscribe(ltSales => {
                                            console.log('Lifetime total course sales:', ltSales);
                                            if (ltSales) {
                                                c.lifetimeTotals = ltSales;
                                                let total = 0;
                                                Object.keys(ltSales).forEach(currency => {
                                                    total += ltSales[currency].lifetimeTotalSales;
                                                });
                                                c.lifetimeTotalSales = total;
                                            }
                                        });
                                    });
                                }
                            });
                        }

                        // Check for purchased courses. Coaches and regular users can purchase courses
                        this.dataService.getPurchasedCourses(this.userId).subscribe(courseIds => {
                            if (courseIds) {
                                console.log('Enrolled In Course Ids:', courseIds);
                                this.purchasedCourses = []; // reset
                                courseIds.forEach((o: any, index) => { // fetch and monitor live / latest course info
                                    this.dataService.getUnlockedPublicCourse(o.id).subscribe(course => {
                                        if (course) {
                                            this.purchasedCourses.push(course);
                                            this.calcCourseProgress(course, index);
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    browseCourses() {
        this.analyticsService.clickBrowseCourses();
        this.router.navigate(['courses']);
    }

    async createCourse() {
        this.analyticsService.clickCreateCourse();
        this.router.navigate(['my-courses', 'new-course']); // navigate to new course page
    }

    calcCourseProgress(course: CoachingCourse, index: number) {
        this.dataService.getPrivateCourseLecturesComplete(this.userId, course.courseId).subscribe(completedLectures => {
            const lecturesComplete = completedLectures.map(i => i.id);
            const pc = (lecturesComplete.length / course.lectures.length) * 100;
            this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
        });
    }

}
