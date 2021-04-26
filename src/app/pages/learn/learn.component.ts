import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ViewChild } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VgAPI } from 'videogular2/compiled/core';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingCourse, CoachingCourseLecture } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { AuthService } from 'app/services/auth.service';
import { CourseBookmark } from 'app/interfaces/course.bookmark.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TestimonialsService } from 'app/services/testimonials.service';
import { Subscription } from 'rxjs';
import { ClientTestimonial } from 'app/interfaces/client.testimonial.interface';

@Component({
  selector: 'app-learn',
  templateUrl: 'learn.component.html',
  styleUrls: ['./learn.component.scss']
})
export class LearnComponent implements OnInit, OnDestroy {

  @ViewChild('reviewModal', {static: false}) public reviewModal: ModalDirective;
  @ViewChild('courseCompleteModal', {static: false}) public courseCompleteModal: ModalDirective;

  public previewAsStudent: boolean;
  public browser: boolean;
  public userId: string;
  private courseId: string;
  private lectureId: string;
  public lecture: CoachingCourseLecture;
  public course: CoachingCourse;
  public activeSectionIndex: number;
  public videoSources = [];
  private vgApi: VgAPI; // http://www.videogular.com/tutorials/videogular-api/
  public lecturesComplete = [];
  public bookmarkForm: FormGroup;
  public bookmarks: CourseBookmark[];
  public bookmarkToRemove: CourseBookmark;
  private testimonials: ClientTestimonial[];
  private coursesComplete = [];
  public courseIsComplete: boolean;
  public testimonialPrompts = [];
  public testimonialPrompted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private dataService: DataService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private testimonialsService: TestimonialsService
  ) {
  }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('learn-page');

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();

      // Check query params for viewing mode
      this.route.queryParams.subscribe(qp => {
        if (qp.previewAsStudent) {
          // console.log('Previewing as Student');
          this.previewAsStudent = true;
        }

        this.route.params.subscribe(params => {
          // Check activated route params for course ID
          this.courseId = params.courseId;

          // Check activated route params for lecture ID
          this.lectureId = params.lectureId;

          if (this.courseId) {
            // load user
            this.subscriptions.add(
              this.authService.getAuthUser().subscribe(user => {
                if (user) {
                  this.userId = user.uid;
                  this.loadCourse();
                  this.fetchTestimonials();
                  this.fetchUserCoursesComplete();
                  this.fetchTestimonialPrompts();
                }
              })
            );
          }
        });
      });

      this.buildBookmarkForm();
    }
  }

  loadCourse() {
    // where we load from depend on whether user has enrolled in a public course or whether the
    // course creator is previewing their own (possibly private) course.

    if (this.previewAsStudent) {
      this.fetchPrivateCourse();
    } else {
      this.fetchPublicCourse();
    }

    // fetch user's course progress
    this.subscriptions.add(
      this.dataService.getPrivateCourseLecturesComplete(this.userId, this.courseId).subscribe(completedLectures => {
        if (completedLectures) {
          this.lecturesComplete = completedLectures.map(i => i.id);
          // console.log('Lectures complete:', this.lecturesComplete);
        }
      })
    );

    // fetch the user's saved bookmarks
    this.monitorSavedBookmarks();
  }

  fetchTestimonials() {
    this.subscriptions.add(
      this.testimonialsService.getClientTestimonials(this.userId).subscribe(data => {
        if (data) {
          // console.log(data);
          this.testimonials = data;
        }
      })
    );
  }

  fetchUserCoursesComplete() {
    this.subscriptions.add(
      this.dataService.getUserCoursesComplete(this.userId).subscribe(data => {
        if (data) {
          this.coursesComplete = data;
          // console.log('Courses complete:', this.coursesComplete);
        }
      })
    );
  }

  fetchPublicCourse() {
    // console.log('Fetching public course');
    const courseSub = this.dataService.getUnlockedPublicCourse(this.courseId).subscribe(fullCourse => {
      if (fullCourse) {
        this.course = fullCourse; // course loaded successfully
        this.loadLecture();
        this.checkIfCourseComplete();
      } else { // course not found!
        this.alertService.alert('warning-message', 'Oops', 'This course does not exist!');
      }
      courseSub.unsubscribe();
    });
    this.subscriptions.add(courseSub);
  }

  fetchPrivateCourse() {
    // console.log('Fetching private course');
    const courseSub = this.dataService.getPrivateCourse(this.userId, this.courseId).subscribe(privateCourse => {
      if (privateCourse) {
        this.course = privateCourse; // course loaded successfully
        this.loadLecture();
        this.checkIfCourseComplete();
      } else { // course not found!
        this.alertService.alert('warning-message', 'Oops', 'This course does not exist!');
      }
      courseSub.unsubscribe();
    });
    this.subscriptions.add(courseSub);
  }

  fetchTestimonialPrompts() {
    this.subscriptions.add(
      this.testimonialsService.fetchUserCoachTestimonialPrompts(this.userId).subscribe(data => {
        if (data) {
          this.testimonialPrompts = data;
          const promptArr = this.testimonialPrompts.map(i => i.id);
          // console.log('client testimonial prompts', promptArr);
          if (promptArr.includes(this.course.sellerUid)) {
            this.testimonialPrompted = true;
          }
        }
      })
    );
  }

  loadLecture() {
    if (this.lectureId) {
      this.loadRequestedLecture();
      this.checkActiveSectionIndex();
    } else {
      this.loadDefaultLecture();
      this.activeSectionIndex = 0;
    }
  }

  loadDefaultLecture() {
    // redirect to the first lecture in the course
    this.lectureId = this.course.sections[0].lectures[0];
    if (this.previewAsStudent) {
      this.router.navigate(['/course', this.courseId, 'learn', 'lecture', this.lectureId], {queryParams: {previewAsStudent: true}});
    } else {
      this.router.navigate(['/course', this.courseId, 'learn', 'lecture', this.lectureId]);
    }
  }

  loadRequestedLecture() {
    // load the requested lecture
    // console.log(`Load requested lecture: ${this.lectureId}`);
    const lectureIndex = this.course.lectures.findIndex(i => i.id === this.lectureId);
    if (lectureIndex === -1) { // lecture not found!
      this.alertService.alert('warning-message', 'Oops', 'Lecture not found!');
      return;
    }
    this.lecture = this.course.lectures[lectureIndex];
    // console.log('Lecture loaded:', this.lecture);
    if (this.lecture.type === 'Video') {
      this.loadVideo();
    }
  }

  checkActiveSectionIndex() {
    // check which section the current lecture is contained in
    const index = this.course.sections.findIndex(i => i.lectures.includes(this.lectureId));
    if (index === -1) {
      console.log('Unable to determine active section index!');
      return;
    }
    this.activeSectionIndex = index;
    // console.log('Active section index:', index);
  }

  checkIfCourseComplete() {
    const completeArr = this.coursesComplete.map(i => i.id);
    // console.log('Completed courses', completeArr);

    if ((this.lecturesComplete.length / this.course.lectures.length === 1) && !completeArr.includes(this.courseId)) {
      console.log('first time course completed!');

      // pop complete modal
      // this.courseCompleteModal.show();

      // save as complete so that we don't keep getting popups when viewing again after completing
      this.markCourseCompleted();

      // what next?
    }
  }

  buildBookmarkForm() {
    this.bookmarkForm = this.formBuilder.group({
      note: [null]
    });
  }

  monitorSavedBookmarks() {
    this.subscriptions.add(
      this.dataService.getPrivateBookmarksByCourse(this.userId, this.courseId).subscribe(bookmarks => {
        if (bookmarks) {
          bookmarks.sort((a, b) => b.lastUpdated - a.lastUpdated); // sort by date (desc)
          this.bookmarks = bookmarks;
          // console.log('bookmarks', this.bookmarks);
        }
      })
    );
  }

  onPlayerReady(api: VgAPI) {
    // fires when the videoGular player is ready
    this.vgApi = api;

    // listen for the data loaded event
    this.vgApi.getDefaultMedia().subscriptions.loadedData.subscribe($event => {
      // console.log('Video loaded data', $event);

      // seek to bookmark point if requested
      this.checkForBookmark();
    });

    // listen for the video ended event
    this.vgApi.getDefaultMedia().subscriptions.ended.subscribe(async $event => {
      // console.log('Video ended:', $event);

      // save lecture complete for this user
      this.saveLectureComplete(this.lectureId);

      // if at prompt point in the course, prompt user for a review and wait for a response before moving on
      // await this.promptUserReviewIfRequired();

      // redirect to the next lecture in the course
      this.redirectToNextLecture();
    });
    // end video ended event listener
  }

  loadVideo() {
    this.videoSources = [];
    this.videoSources.push(this.lecture.video.downloadURL);
  }

  checkForBookmark() {
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        const bm = params.bookmark;
        // console.log('Bookmark:', bm);
        if (bm) { // user has requested video at saved bookmark point
          this.vgApi.seekTime(Math.round(bm));
        }
      })
    );
  }

  pauseVideo() {
    this.vgApi.pause();
  }

  onLectureCompleteChange(event: any) {
    const ev = JSON.parse(event);
    ev.complete ? this.saveLectureComplete(ev.lectureId) : this.saveLectureIncomplete(ev.lectureId);
  }

  async saveBookmark() {
    const bookmark: CourseBookmark = {
      userId: this.userId,
      courseId: this.courseId,
      lectureId: this.lectureId,
      position: this.vgApi.currentTime,
      lastUpdated: Math.floor(new Date().getTime() / 1000),
      note: this.bookmarkForm.controls.note.value
    };
    // console.log('saving bookmark:', bookmark);
    await this.dataService.savePrivateCourseBookmark(bookmark);

    this.alertService.alert('success-message', 'Success!', `Bookmark saved to your bookmarks tab.`);
  }

  async promptTestimonialIfRequired() {
    return new Promise(resolve => {
      // check if user has already written coach testimonial
      if (this.testimonials && this.testimonials.findIndex(i => i.coachUid === this.course.sellerUid) !== -1) {
        // console.log('testimonial already written');
        resolve(false);
        return;
      }

      // check if user has already been prompted for a testimonial
      console.log('testimonialPrompted?:', this.testimonialPrompted);
      if (this.testimonialPrompted) {
        resolve(false);
        return;
      }

      // compare lectures complete to all lectures.
      // if no recorded review, calculate if a prompt point has been reached.
      // if required, prompt the user for a review now...
      const totalLectures = this.course.lectures.length;

      const firstPromptPoint = .2; // 20% progress

      // console.log('Progress:', this.lecturesComplete.length / totalLectures);

      if ((this.lecturesComplete.length / totalLectures) > firstPromptPoint) {
        // pop modal with a promise that resolves on complete
        this.reviewModal.show();
        this.subscriptions.add(
          this.reviewModal.onHide.subscribe(res => {
            // console.log('result:', res);
            // whether or not review saved, mark as review prompted
            this.markAsTestimonialPrompted();
            resolve(true);
            return;
          })
        );
      }
    });
  }

  async onTestimonialSavedEvent() {
    await this.alertService.alert('success-message', 'Success!', `Thanks for leaving a testimonial!`);
  }

  markAsTestimonialPrompted() {
    // mark that the user does not wish to leave a testimonial now, and shouldn't be prompted again until
    // reaching a defined point (eg end of course)
    this.testimonialsService.markUserCoachTestimonialPrompted(this.userId, this.course.sellerUid);
  }

  markCourseCompleted() {
    this.dataService.markCourseCompleteForUser(this.userId, this.course);
  }

  async saveLectureComplete(lectureId: string) {
    // only save to db if not already complete
    if (this.lecturesComplete.includes(lectureId)) {
      // console.log(`Lecture ${lectureId} already completed!`);
      return;
    }
    // console.log(`I should save lecture ${lectureId} complete now!`);
    await this.dataService.savePrivateLectureComplete(this.userId, this.courseId, lectureId);
  }

  async saveLectureIncomplete(lectureId: string) {
    // only save to db if already complete
    if (!this.lecturesComplete.includes(lectureId)) {
      // console.log(`Lecture ${lectureId} NOT already completed!`);
      return;
    }
    // console.log(`I should save lecture ${lectureId} as incomplete now!`);
    await this.dataService.savePrivateLectureIncomplete(this.userId, this.courseId, lectureId);
  }

  redirectToNextLecture() {
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
        if (this.previewAsStudent) {
          this.router.navigate(['/course', this.courseId, 'learn', 'lecture', nextSectionLectureId], {queryParams: {previewAsStudent: true}});
        } else {
          this.router.navigate(['/course', this.courseId, 'learn', 'lecture', nextSectionLectureId]);
        }
        return;
      }

      // no, safe to load next lecture
      const nextLectureId = this.course.sections[this.activeSectionIndex].lectures[lIndex + 1];
      if (this.previewAsStudent) {
        this.router.navigate(['/course', this.courseId, 'learn', 'lecture', nextLectureId], {queryParams: {previewAsStudent: true}});
      } else {
        // console.log('Navigating to:', '/course', this.courseId, 'learn', 'lecture', nextLectureId);
        this.router.navigate(['/course', this.courseId, 'learn', 'lecture', nextLectureId]);
      }

    } else {
      console.log('Unable to redirect to next lecture. Active section index not set yet!');
    }
  }

  redirectToPreviousLecture() {
    if (this.activeSectionIndex !== undefined) {
      // is this the first lecture in the active section?
      const lIndex = this.course.sections[this.activeSectionIndex].lectures.findIndex(i => i === this.lectureId);
      if (lIndex === -1) {
        console.log('Lecture not found in active section!');
        return;
      }
      if (lIndex === 0) {
        // yes, is this the first section in the course?
        if (this.activeSectionIndex === 0) {
          // yes, ???
          console.log('Cannot go back - this is the first lecture in this course!');
          return;
        }
        // no, load the last lecture in the previous section
        const previousSectionLectureId = this.course.sections[this.activeSectionIndex - 1].lectures[this.course.sections[this.activeSectionIndex - 1].lectures.length - 1];
        if (this.previewAsStudent) {
          this.router.navigate(['/course', this.courseId, 'learn', 'lecture', previousSectionLectureId], {queryParams: {previewAsStudent: true}});
        } else {
          this.router.navigate(['/course', this.courseId, 'learn', 'lecture', previousSectionLectureId]);
        }
      }

      // no, safe to load previous lecture in current section
      const previousLectureId = this.course.sections[this.activeSectionIndex].lectures[lIndex - 1];
      if (this.previewAsStudent) {
        this.router.navigate(['/course', this.courseId, 'learn', 'lecture', previousLectureId], {queryParams: {previewAsStudent: true}});
      } else {
        this.router.navigate(['/course', this.courseId, 'learn', 'lecture', previousLectureId]);
      }

    } else {
      console.log('Unable to redirect to previous lecture. Active section index not set yet!');
    }
  }

  onArticlePreviousLecture() {
    this.redirectToPreviousLecture();
  }

  onArticleNextLecture() {
    this.saveLectureComplete(this.lecture.id);
    this.redirectToNextLecture();
  }

  fancyTimeFormat(time: number) {
    // Hours, minutes and seconds
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = '';

    if (hrs > 0) {
      ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;
    return ret;
  }

  getLectureTitle(lectureId: string) {
    if (this.course) {
      const index = this.course.lectures.findIndex(i => i.id === lectureId);
      if (index === -1) {
        return '';
      }
      return this.course.lectures[index].title;
    }
    return '';
  }

  async removeBookmark() {
    if (this.bookmarkToRemove) {
      const bookmark = JSON.parse(JSON.stringify(this.bookmarkToRemove));
      await this.dataService.deletePrivateCourseBookmark(bookmark);
    }
  }

  truncate = (input: string, max: number) => input.length > max ? `${input.substring(0, max)}...` : input;

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('learn-page');
  }

}
