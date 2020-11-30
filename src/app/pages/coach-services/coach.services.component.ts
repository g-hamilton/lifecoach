import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'coach.services.component.html',
  styleUrls: ['./coach.services.component.scss']
})
export class CoachServicesComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public publishedPrograms: CoachingProgram[]; // programs created as coach
  public publishedCourses: CoachingCourse[]; // ecourses created as coach
  public publishedServices: CoachingService[]; // TODO
  private subscriptions: Subscription = new Subscription();
  public objKeys = Object.keys;
  public currencies: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private currenciesService: CurrenciesService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.currencies = this.currenciesService.getCurrencies();
      this.getUserData();
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;

          // Check for created ecourses
          this.subscriptions.add(
            this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
              if (courses) {
                this.publishedCourses = courses;
                // console.log('Published Courses:', courses);

                const now = new Date();
                const month = now.getMonth() + 1; // we dont store zero based. jan === 1
                const year = now.getFullYear();

                // Load stats
                courses.forEach((c, i) => {
                  const courseId = c.courseId;
                  // Load course sales broken down by month
                  this.subscriptions.add(
                    this.dataService.getCourseSalesByMonth(this.userId, month, year, courseId).subscribe(sales => {
                      if (sales) { // should be an array of custom free or paid course enrollment objects
                        // console.log(`Sales for course ${courseId}`, sales);

                        // map a new array containing unique currencies from all sales in the month
                        const uniqueCurrencies = [...new Set(sales.map(item => item.currency))];
                        // console.log('Unique currencies:', uniqueCurrencies);

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
                          monthEarningsByCurrency[currencyString] = {monthTotalInThisCurrency};
                        });

                        // console.log(`Monthly earnings totals by currencies for course ${courseId}`, monthEarningsByCurrency);

                        // add this data into the course object
                        this.publishedCourses[i].monthlyEarnings = monthEarningsByCurrency;
                      }
                    })
                  );

                  // Load lifetime total sales for this course
                  this.subscriptions.add(
                    this.dataService.getLifetimeTotalCourseSales(this.userId, courseId).subscribe(ltSales => {
                      // console.log('Lifetime total course sales:', ltSales);
                      if (ltSales) {
                        c.lifetimeTotals = ltSales;
                        let total = 0;
                        Object.keys(ltSales).forEach(currency => {
                          total += ltSales[currency].lifetimeTotalSales;
                        });
                        c.lifetimeTotalSales = total;
                      }
                    })
                  );
                });
              }
            })
          );

          // check coach services
          this.subscriptions.add(
            this.dataService.getCoachServices(this.userId).subscribe(services => {
              if (services) {
                this.publishedServices = services;
              }
            })
          );
        }
      })
    );
  }

  async createProgram() {
    this.analyticsService.clickCreateProgram();
    this.router.navigate(['my-programs', 'new-program']); // navigate to new program page
  }

  async createCourse() {
    this.analyticsService.clickCreateCourse();
    this.router.navigate(['my-courses', 'new-course']); // navigate to new course page
  }

  onAddCoachingService() {
    //
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
