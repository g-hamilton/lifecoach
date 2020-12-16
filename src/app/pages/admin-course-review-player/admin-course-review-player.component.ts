import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { AdminCourseReviewRequest } from 'app/interfaces/adminCourseReviewRequest';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VgAPI } from 'videogular2/compiled/core';
import { CoachingCourse, CoachingCourseLecture } from 'app/interfaces/course.interface';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-course-review-player',
  templateUrl: './admin-course-review-player.component.html'
})
export class AdminCourseReviewPlayerComponent implements OnInit, OnDestroy {

  public browser: boolean;
  public userId: string; // admin's uid
  private courseId: string;
  public reviewRequest: AdminCourseReviewRequest;
  public course: CoachingCourse;
  private lectureId: string;
  public lecture: CoachingCourseLecture;
  public lecturesComplete = [];
  public activeSectionIndex: number;
  public videoSources = [];
  private vgApi: VgAPI; // http://www.videogular.com/tutorials/videogular-api/

  public rejectForm: FormGroup;
  public focus: boolean;
  public focusTouched: boolean;

  public approving: boolean;
  public rejecting: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public formBuilder: FormBuilder,
    private cloudFunctionsService: CloudFunctionsService,
    private dataService: DataService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getRouteData();
      this.getUserData();
      this.buildRejectForm();
    }
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.courseId) {
        this.courseId = params.courseId;
        console.log('Activated course ID', this.courseId);
        this.loadReviewRequest();
      }
    });
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      })
    );
  }

  buildRejectForm() {
    this.rejectForm = this.formBuilder.group({
      reason: ['', [Validators.required]]
    });
  }

  loadReviewRequest() {
    this.subscriptions.add(
      this.dataService.getCourseReviewRequest(this.courseId).subscribe(data => {
        if (data) {
          this.reviewRequest = data;
          if (this.reviewRequest.sellerUid) {
            this.loadCourse();
          } else {
            console.error('No seller UID - cannot load course!');
          }
        }
      })
    );
  }

  loadCourse() {
    this.subscriptions.add(
      this.dataService.getPrivateCourse(this.reviewRequest.sellerUid, this.courseId).subscribe(course => {
        if (course) {
          this.course = course;
          console.log('Course loaded:', this.course);
          this.checkLectureId();
        }
      })
    );
  }

  checkLectureId() {
    // Check activated route params for lecture ID
    this.route.params.subscribe(params => {
      this.lectureId = params.lectureId;
      if (this.lectureId) {
        this.loadRequestedLecture();
        this.checkActiveSectionIndex();
      } else {
        this.loadDefaultLecture();
        this.activeSectionIndex = 0;
      }
    });
  }

  loadDefaultLecture() {
    // redirect to the first lecture in the course
    const orderedLectures = [];
    if (this.course.sections) {
      this.course.sections.forEach(s => {
        if (s.lectures) {
          s.lectures.forEach(l => {
            orderedLectures.push(l);
          });
        }
      });
    }
    const firstLecture = orderedLectures[0];
    if (firstLecture) {
      this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', firstLecture]);
    }
  }

  loadRequestedLecture() {
    // load the requested lecture
    console.log(`Load requested lecture: ${this.lectureId}`);
    const lectureIndex = this.course.lectures.findIndex(i => i.id === this.lectureId);
    if (lectureIndex === -1) { // lecture not found!
      this.alertService.alert('warning-message', 'Oops', 'Lecture not found!');
      return;
    }
    this.lecture = this.course.lectures[lectureIndex];
    console.log('Lecture loaded:', this.lecture);
    if (this.lecture.type === 'Video') {
      this.loadVideo();
    }
  }

  checkActiveSectionIndex() {
    // check which section the current lecture is contained in
    const index = this.course.sections.findIndex(i => {
      if (i.lectures) {
        return i.lectures.includes(this.lectureId);
      }
      return -1;
    });
    if (index === -1) {
      console.log('Unable to determine active section index!');
      return;
    }
    this.activeSectionIndex = index;
    console.log('Active section index:', index);
  }

  loadVideo() {
    this.videoSources = [];
    this.videoSources.push(this.lecture.video.downloadURL);
  }

  onPlayerReady(api: VgAPI) {
    // fires when the videoGular player is ready
    this.vgApi = api;

    // listen for the data loaded event

    this.vgApi.getDefaultMedia().subscriptions.loadedData.subscribe($event => {
      console.log('Video loaded data', $event);

      // seek to bookmark point if requested
      // this.checkForBookmark();
    });

    // listen for the video ended event
    this.vgApi.getDefaultMedia().subscriptions.ended.subscribe($event => {
      console.log('Video ended:', $event);

      // save lecture complete for this user
      // this.saveLectureComplete(this.lectureId);

      // redirect to the next lecture in the course
      if (this.activeSectionIndex !== undefined) {
        // is this the last lecture in the active section?
        const lIndex = this.course.sections[this.activeSectionIndex].lectures.findIndex(i => i === this.lectureId);
        if (lIndex === -1) {
          console.log('Lecture not found in active section!');
          return;
        }
        if (lIndex === this.course.sections[this.activeSectionIndex].lectures.length - 1) {
          // yes, is this the last section in the course?
          if (this.activeSectionIndex === this.course.sections.length - 1) {
            // yes, ???
            console.log('Completed the final lecture in this course!');
            return;
          }
          // no, load the first lecture in the next section
          const nextSectionLectureId = this.course.sections[this.activeSectionIndex + 1].lectures[0];
          this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', nextSectionLectureId]);
        }

        // no, safe to load next lecture
        const nextLectureId = this.course.sections[this.activeSectionIndex].lectures[lIndex + 1];
        this.router.navigate(['/admin-course-review-player', this.courseId, 'learn', 'lecture', nextLectureId]);

      } else {
        console.log('Unable to redirect to next lecture. Active section index not set yet!');
      }
    });
    // end video ended event listener
  }

  onLectureCompleteChange(event: any) {
    const ev = JSON.parse(event);
    // Do nothing deliberately
  }

  get rejectF(): any {
    return this.rejectForm.controls;
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  async approveCourse() {
    this.approving = true;

    // safety checks
    if (!this.reviewRequest) {
      this.alertService.alert('warning-message', 'Oops', 'Missing review request. Unable to approve course.');
      this.approving = false;
      return;
    }
    if (!this.courseId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing course ID. Unable to approve course.');
      this.approving = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve course.');
      this.approving = false;
      return;
    }

    // attempt approval
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Confirm', 'Confirm course approval.', 'Yes - Confirm') as any;
    if (res && res.action) { // user confirms
      console.log('Sending course review approval:', this.courseId, this.userId, this.reviewRequest);
      const response = await this.cloudFunctionsService.adminApproveCourseReview(this.courseId, this.userId, this.reviewRequest) as any;
      if (response.error) { // error
        this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
        this.approving = false;
        return;
      }
      // success
      this.analyticsService.adminApproveCourse(this.courseId);
      await this.alertService.alert('success-message', 'Success!', 'eCourse Approved.');
      this.router.navigate(['/admin-course-review']);
    }
    this.approving = false;
  }

  async rejectCourse() {
    this.rejecting = true;

    // safety checks
    if (!this.courseId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing course ID. Unable to reject course.');
      this.rejecting = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing user ID. Unable to approve course.');
      this.rejecting = false;
      return;
    }
    if (this.rejectForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Invalid form data.');
      this.rejecting = false;
      return;
    }
    if (!this.reviewRequest) {
      this.alertService.alert('warning-message', 'Oops', 'Missing review request data.');
      this.rejecting = false;
      return;
    }

    // update the review request object with reject data
    this.reviewRequest.rejectData = this.rejectForm.value;

    // attemp rejection
    const response = await this.cloudFunctionsService.adminRejectCourseReview(this.courseId, this.userId, this.reviewRequest) as any;
    if (response.error) { // error
      this.alertService.alert('warning-message', 'Oops', JSON.stringify(response));
      this.rejecting = false;
      return;
    }
    // success
    this.rejecting = false;
    this.analyticsService.adminRejectCourse(this.courseId);
    await this.alertService.alert('success-message', 'Success!', 'Course rejected. Feedback sent to course creator.');
    this.router.navigate(['/admin-course-review']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
