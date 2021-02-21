import { Component, OnInit, Inject, PLATFORM_ID, Input, OnDestroy, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { UserAccount } from 'app/interfaces/user.account.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';

import { DataService } from '../../services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';

import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-edit-course-lectures',
  templateUrl: 'edit.course.lectures.component.html'
})
export class EditCourseLecturesComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;

  public browser: boolean;
  public activeRouteCourseId: string;
  public activeRouteSectionId: string;
  public activeRouteLectureId: string;

  public userId: string;
  public account: UserAccount;

  public course: CoachingCourse;

  public isNewCourse: boolean;
  public isNewSection: boolean;
  public isNewLecture: boolean;

  public reviewRequest: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      if (this.router.url.includes('new-course')) {
        this.isNewCourse = true;
      }
      if (this.router.url.includes('section') && this.router.url.includes('new')) {
        this.isNewSection = true;
      }
      if (this.router.url.includes('lecture') && this.router.url.includes('new')) {
        this.isNewLecture = true;
      }
      this.loadUserData();
    }
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.courseId) {
        this.activeRouteCourseId = params.courseId;
        this.loadCourse();
      }
      if (params.sectionId) {
        this.activeRouteSectionId = params.sectionId;
      }
      if (params.lectureId) {
        this.activeRouteLectureId = params.lectureId;
      }
    });
  }

  loadUserData() {
    this.route.queryParams.subscribe(qP => {
      if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
        this.userId = qP.targetUser;
        this.getRouteData();
        this.subscriptions.add(
          this.dataService.getUserAccount(this.userId).subscribe(account => {
            if (account) {
              this.account = account;
            }
          })
        );
      } else { // User editing their own course
        this.subscriptions.add(
          this.authService.getAuthUser().subscribe(user => {
            if (user) {
              this.userId = user.uid;
              this.getRouteData();
              this.subscriptions.add(
                this.dataService.getUserAccount(this.userId).subscribe(account => {
                  if (account) {
                    this.account = account;
                  }
                })
              );
            }
          })
        );
      }
    });
  }

  loadCourse() {
    if (this.userId && this.activeRouteCourseId) {
      // subscribe to course data
      this.subscriptions.add(
        this.dataService.getPrivateCourse(this.userId, this.activeRouteCourseId).subscribe(course => {
          if (course) { // course exists
            this.course = course;
            // console.log('Course loaded:', this.course);
          } else {
            console.log(`Course with id ${this.activeRouteCourseId} does not exist!`);
          }
        })
      );

      // subscribe to course review status
      this.subscriptions.add(
        this.dataService.getCourseReviewRequest(this.activeRouteCourseId).subscribe(data => {
          if (data) {
            this.reviewRequest = data;
          }
        })
      );
    }
  }

  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  scrollToTop() {
    if (this.browser) {
      (function smoothscroll() {
        const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - (currentScroll / 8));
        }
      })();
    }
  }

  onGoNextEvent(id: number) {
    // console.log('onGoNextEvent:', id);
    this.selectTab(id);
    this.scrollToTop();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
