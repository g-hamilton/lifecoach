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
import { CoachProfile } from 'app/interfaces/coach.profile.interface';

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
  public publishedServices: CoachingService[]; // services created as coach
  private subscriptions: Subscription = new Subscription();
  public objKeys = Object.keys;
  public currencies: any;
  public userProfile: CoachProfile;

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

          // Check for a public coach profile.
          // Important: Profile must be completed & made public before we allow creation of products & services
          this.subscriptions.add(
            this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
              if (profile) {
                this.userProfile = profile;
                // console.log('Fetched profile:', profile);
              }
            })
          );

          // Check for created programs
          this.subscriptions.add(
            this.dataService.getPrivatePrograms(this.userId).subscribe(programs => {
              if (programs) {
                this.publishedPrograms = programs;
                // console.log('Published Programs:', programs);
              }
            })
          );

          // Check for created ecourses
          this.subscriptions.add(
            this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
              if (courses) {
                this.publishedCourses = courses;
                // console.log('Published Courses:', courses);
              }
            })
          );

          // check coach services
          this.subscriptions.add(
            this.dataService.getPrivateServices(this.userId).subscribe(services => {
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

  async createService() {
    this.analyticsService.clickCreateService();
    this.router.navigate(['my-services', 'new-service']); // navigate to new service page
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
