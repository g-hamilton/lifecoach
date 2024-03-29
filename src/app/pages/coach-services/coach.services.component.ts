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
  public subscriptionPlan: any;

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

          // check custom user claims
          user.getIdTokenResult(true)
          .then(tokenRes => {
            console.log('User claims:', tokenRes.claims);
            const c = tokenRes.claims;
            if (c.subscriptionPlan) {
              this.subscriptionPlan = c.subscriptionPlan;
              console.log('Subscription plan:', this.subscriptionPlan);
              if (this.subscriptionPlan === 'flame' || this.subscriptionPlan === 'blaze') { // load courses if on flame or blaze plan
                this.getCoacheCourses();
              }
            }
          });

          // for all plan users...
          this.getCoachProfile(); // Important: Profile must be completed & made public before we allow creation of products & services
          this.getCoachServices();
          this.getCoachPrograms();
        }
      })
    );
  }

  getCoachProfile() {
    this.subscriptions.add(
      this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          // console.log('Fetched profile:', profile);
        }
      })
    );
  }

  getCoachServices() {
    this.subscriptions.add(
      this.dataService.getPrivateServices(this.userId).subscribe(services => {
        if (services) {
          this.publishedServices = services;
          // console.log('Services:', services);
        }
      })
    );
  }

  getCoachPrograms() {
    this.subscriptions.add(
      this.dataService.getPrivatePrograms(this.userId).subscribe(programs => {
        if (programs) {
          this.publishedPrograms = programs;
          // console.log('Programs:', programs);
        }
      })
    );
  }

  getCoacheCourses() {
    this.subscriptions.add(
      this.dataService.getPrivateCourses(this.userId).subscribe(courses => {
        if (courses) {
          this.publishedCourses = courses;
          // console.log('eCourses:', courses);
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
