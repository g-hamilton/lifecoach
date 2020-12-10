import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CourseReviewsService } from 'app/services/course-reviews.service';
import { ProgramReviewsService } from 'app/services/program-reviews.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { ProgramReview } from 'app/interfaces/program-review';
import { CourseReview } from 'app/interfaces/course-review';
import { map } from 'rxjs/operators';
import { DataService } from 'app/services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-course-coach',
  templateUrl: './course-coach.component.html',
  styleUrls: ['./course-coach.component.scss']
})
export class CourseCoachComponent implements OnInit, OnChanges, OnDestroy {

  @Input() previewAsStudent: boolean;
  @Input() course: CoachingCourse;

  private subscriptions: Subscription = new Subscription();

  public courseReviews: CourseReview[];
  public programReviews: ProgramReview[];
  public avgCourseRating: number;
  public avgProgramRating: number;
  public sellerCourseEnrollments: Observable<any>;
  public sellerProgramEnrollments: Observable<any>;
  public sellerCourses: Observable<CoachingCourse[]>;
  public sellerPrograms: Observable<CoachingProgram[]>;
  public sellerImage: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private transferState: TransferState,
    private courseReviewsService: CourseReviewsService,
    private programReviewsService: ProgramReviewsService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.course) {
      this.fetchCourseReviewsData();
      this.fetchProgramReviewsData();
      this.fetchSellerCourseEnrollmentsData();
      this.fetchSellerProgramEnrollmentsData();
      this.fetchSellerCoursesData();
      this.fetchSellerProgramsData();
      this.fetchCoachPhotoFromProfile();
    }
  }

  fetchCourseReviewsData() {
    const REVIEWS_KEY = makeStateKey<any>('course-reviews'); // create a key for saving/retrieving state

    const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

    if (reviewsData === null) { // if state data does not exist - retrieve it from the api

      // get this coach's course reviews
      this.subscriptions.add(
        this.courseReviewsService.getSellerCourseReviews(this.course.sellerUid).subscribe(data => {
          this.courseReviews = data;

          // calc avg rating for this coach's courses
          const ratings = this.courseReviews.map(v => v.starValue);
          this.avgCourseRating = ratings.length ? ratings.reduce((total, val) => total + val) / ratings.length : null;

          if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
            this.transferState.set(REVIEWS_KEY, this.courseReviews);
          }
        })
      );

    } else { // if reviews state data exists retrieve it from the state storage
      this.courseReviews = reviewsData;
      // console.log('Course reviews data for user:', reviewsData);
      this.transferState.remove(REVIEWS_KEY);
    }
  }

  fetchProgramReviewsData() {
    const REVIEWS_KEY = makeStateKey<any>('program-reviews'); // create a key for saving/retrieving state

    const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

    if (reviewsData === null) { // if state data does not exist - retrieve it from the api

      // get this coach's program reviews
      this.subscriptions.add(
        this.programReviewsService.getSellerProgramReviews(this.course.sellerUid).subscribe(data => {
          this.programReviews = data;

          // calc avg rating for this coach's programs
          const ratings = this.programReviews.map(v => v.starValue);
          this.avgProgramRating = ratings.length ? ratings.reduce((total, val) => total + val) / ratings.length : null;

          if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
            this.transferState.set(REVIEWS_KEY, this.programReviews);
          }
        })
      );

    } else { // if reviews state data exists retrieve it from the state storage
      this.programReviews = reviewsData;
      // console.log('Program reviews data for user:', reviewsData);
      this.transferState.remove(REVIEWS_KEY);
    }
  }

  fetchSellerCourseEnrollmentsData() {
    const ENROLLMENTS_KEY = makeStateKey<any>('course-enrollments'); // create a key for saving/retrieving state

    const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

    if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
      this.sellerCourseEnrollments = this.dataService.getTotalPublicEnrollmentsByCourseSeller(this.course.sellerUid);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerCourseEnrollments.subscribe(data => {
            if (data) {
              this.transferState.set(ENROLLMENTS_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerCourseEnrollments = enrollmentsData;
      this.transferState.remove(ENROLLMENTS_KEY);
    }
  }

  fetchSellerProgramEnrollmentsData() {
    const ENROLLMENTS_KEY = makeStateKey<any>('program-enrollments'); // create a key for saving/retrieving state

    const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

    if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
      this.sellerProgramEnrollments = this.dataService.getTotalPublicProgramEnrollmentsBySeller(this.course.sellerUid);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerProgramEnrollments.subscribe(data => {
            if (data) {
              this.transferState.set(ENROLLMENTS_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerProgramEnrollments = enrollmentsData;
      this.transferState.remove(ENROLLMENTS_KEY);
    }
  }

  fetchSellerCoursesData() {
    const COURSES_KEY = makeStateKey<any>('courses'); // create a key for saving/retrieving state

    const coursesData = this.transferState.get(COURSES_KEY, null as any); // checking if data in the storage exists

    if (coursesData === null) { // if state data does not exist - retrieve it from the api
      this.sellerCourses = this.dataService.getPublicCoursesBySeller(this.course.sellerUid);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerCourses.subscribe(data => {
            if (data) {
              this.transferState.set(COURSES_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerCourses = coursesData;
      this.transferState.remove(COURSES_KEY);
    }
  }

  fetchSellerProgramsData() {
    const PROGRAMS_KEY = makeStateKey<any>('programs'); // create a key for saving/retrieving state

    const programsData = this.transferState.get(PROGRAMS_KEY, null as any); // checking if data in the storage exists

    if (programsData === null) { // if state data does not exist - retrieve it from the api
      this.sellerPrograms = this.dataService.getPublicProgramsBySeller(this.course.sellerUid);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerPrograms.subscribe(data => {
            if (data) {
              this.transferState.set(PROGRAMS_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerPrograms = programsData;
      this.transferState.remove(PROGRAMS_KEY);
    }
  }

  fetchCoachPhotoFromProfile() {
    if (this.previewAsStudent && !this.course.coachPhoto && !this.sellerImage) { // if course creator is previewing as a student and photo has not yet been added to the course
      // fetch seller's profile image
      const tempSub = this.dataService.getCoachProfile(this.course.sellerUid).subscribe(profile => {
        console.log(profile);
        if (profile) {
          this.sellerImage = profile.photo;
        }
        tempSub.unsubscribe();
      });
      this.subscriptions.add(tempSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
