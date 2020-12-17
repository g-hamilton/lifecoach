import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from 'app/services/alert.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-coach-as-regular-user',
  templateUrl: 'coach.as.regular.user.component.html'
})
export class CoachAsRegularUserComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public purchasedCourses = [] as CoachingCourse[]; // purchased ecourses as buyer/regular type user
  public purchasedPrograms = [] as CoachingProgram[]; // purchased programs as buyer/regular type user
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
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
          const token = await user.getIdTokenResult(true);
          // console.log('Claims:', token.claims);

          // Check for purchased courses. Coaches and regular users can purchase courses
          this.subscriptions.add(
            this.dataService.getPurchasedCourses(this.userId).subscribe(courseIds => {
              if (courseIds) {
                // console.log('Enrolled In Course Ids:', courseIds);
                this.purchasedCourses = []; // reset
                courseIds.forEach((o: any, index) => { // fetch and monitor live / latest course info
                  this.subscriptions.add(
                    this.dataService.getUnlockedPublicCourse(o.id).subscribe(course => {
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

          // Check for purchased programs. Coaches and regular users can purchase programs
          this.subscriptions.add(
            this.dataService.getPurchasedPrograms(this.userId).subscribe(programIds => {
              if (programIds) {
                console.log('Enrolled In Program Ids:', programIds);
                this.purchasedPrograms = []; // reset
                programIds.forEach((o: any, index) => { // fetch and monitor live / latest program info
                  this.subscriptions.add(
                    this.dataService.getUnlockedPublicProgram(o.id).subscribe(program => {
                      if (program) {
                        this.purchasedPrograms.push(program);
                        // this.calcProgramProgress(program, index); TODO
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

  clickBrowsePrograms() {
    this.analyticsService.clickBrowsePrograms();
  }

  clickBrowseCourses() {
    this.analyticsService.clickBrowseCourses();
  }

  browseCourses() {
    this.clickBrowseCourses();
    this.router.navigate(['courses']);
  }

  browsePrograms() {
    this.clickBrowsePrograms();
    this.router.navigate(['programs']);
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
