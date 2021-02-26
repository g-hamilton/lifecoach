import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from 'app/services/alert.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-courses',
  templateUrl: 'mycourses.component.html'
})
export class MyCoursesComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public purchasedCourses = [] as CoachingCourse[]; // purchased courses as buyer
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.loadUserData();
    }
  }

  loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(async user => {
        if (user) {
          this.userId = user.uid;

          // at this point (if coming here immediately after a purchase), the user may
          // be authorised, but their auth object may be missing the required claims
          // until cloud functions / webhooks complete...

          // Check for purchased courses
          // Coaches and regular users can purchase courses...
          this.subscriptions.add(
            this.dataService.getPurchasedCourses(this.userId).subscribe(async courseIds => {
              if (courseIds) {
                // user is enrolled in at least one course now
                // console.log('Enrolled In Course Ids:', courseIds);
                // important: force refresh the auth token to update the latest claims
                // before calling for unlocked data (requires auth claim to get through paywall)
                const token = await user.getIdTokenResult(true);
                // console.log('Claims:', token.claims);
                this.purchasedCourses = []; // reset
                courseIds.forEach((o: any, index) => { // fetch and monitor live / latest course info
                  this.subscriptions.add(
                    this.dataService.getUnlockedPublicCourse(o.id).subscribe(course => {
                      // console.log('Unlocked course:', course);
                      if (course) {
                        this.purchasedCourses.push(course);
                        this.calcCourseProgress(course, index);
                      }
                    })
                  );
                });
              }
            })
          );
        }
      })
    );
  }

  browseCourses() {
    this.analyticsService.clickBrowseCourses();
  }

  calcCourseProgress(course: CoachingCourse, index: number) {
    this.subscriptions.add(
      this.dataService.getPrivateCourseLecturesComplete(this.userId, course.courseId).subscribe(completedLectures => {
        const lecturesComplete = completedLectures.map(i => i.id);
        const pc = (lecturesComplete.length / course.lectures.length) * 100;
        this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
