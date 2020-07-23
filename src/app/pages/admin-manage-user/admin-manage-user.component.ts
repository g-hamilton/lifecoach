import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-admin-manage-user',
  templateUrl: './admin-manage-user.component.html',
  styleUrls: ['./admin-manage-user.component.scss']
})
export class AdminManageUserComponent implements OnInit {

  public browser: boolean;
  public targetUserUid: string;
  public account: UserAccount;
  public accountType: 'regular' | 'coach' | 'publisher' | 'provider' | 'admin';
  public purchasedCourses = [] as CoachingCourse[]; // purchased courses as buyer
  public courses: CoachingCourse[]; // courses created as coach seller

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private alertService: AlertService
  ) { }

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
      this.dataService.getUserAccount(this.targetUserUid).subscribe(account => {
          if (account) {
              this.account = account;
              this.accountType = account.accountType;

              if (this.accountType === 'coach') { // because only coaches can publish courses
                  // Check for created courses (as coach seller)
                  this.dataService.getPrivateCourses(this.targetUserUid).subscribe(courses => {
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
                              this.dataService.getCourseSalesByMonth(this.targetUserUid, month, year, courseId).subscribe(sales => {
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
                                      this.courses[i].monthlyEarnings = monthEarningsByCurrency;
                                  }
                              });
                              // Load lifetime total sales for this course
                              this.dataService.getLifetimeTotalCourseSales(this.targetUserUid, courseId).subscribe(ltSales => {
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
              this.dataService.getPurchasedCourses(this.targetUserUid).subscribe(courseIds => {
                  if (courseIds) {
                      console.log('Purchased Course Ids:', courseIds);
                      this.purchasedCourses = []; // reset
                      courseIds.forEach((o: any, index) => { // fetch and monitor live / latest course info
                          this.dataService.getPublicCourse(o.id).subscribe(course => {
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
  }

  calcCourseProgress(course: CoachingCourse, index: number) {
    this.dataService.getPrivateCourseLecturesComplete(this.targetUserUid, course.courseId).subscribe(completedLectures => {
      const lecturesComplete = completedLectures.map(i => i.id);
      const pc = (lecturesComplete.length / course.lectures.length) * 100;
      this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
    });
  }

  viewPublicUserProfile() {
    this.router.navigate(['/coach', this.targetUserUid]);
  }

  editUserProfile() {
    this.router.navigate(['/admin-edit-user-profile', this.targetUserUid]);
  }

  async createUserCourse() {
    if (!this.account.stripeUid) { // alert if no stripe account for info
      this.alertService.alert('info-message', 'Be Aware!', `This user has no Stripe account.`);
    }
    this.router.navigate(['my-courses', 'new-course'], { queryParams: { targetUser: this.targetUserUid }});
  }

  viewUserCourse(courseId: string) {
    //
  }

  editUserCourse(courseId: string) {
    this.router.navigate(['/my-courses', courseId, 'content'], { queryParams: { targetUser: this.targetUserUid }});
  }

}
