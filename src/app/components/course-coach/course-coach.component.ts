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

@Component({
  selector: 'app-course-coach',
  templateUrl: './course-coach.component.html',
  styleUrls: ['./course-coach.component.scss']
})
export class CourseCoachComponent implements OnInit, OnChanges, OnDestroy {

  @Input() previewAsStudent: boolean;
  @Input() course: CoachingCourse;

  public userReviews: Observable<CourseReview[]>;
  public avgRating: Observable<any>;
  public sellerEnrollments: Observable<any>;
  public sellerCourses: Observable<CoachingCourse[]>;
  public sellerImage: string;
  private subscriptions: Subscription = new Subscription();

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
      // console.log(this.course);
      this.fetchReviewsData();
      this.fetchSellerCourseEnrollmentsData();
      this.fetchSellerCoursesData();
      this.fetchCoachPhotoFromProfile();
    }
  }

  fetchReviewsData() {
    const REVIEWS_KEY = makeStateKey<any>('reviews'); // create a key for saving/retrieving state

    const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

    if (reviewsData === null) { // if state data does not exist - retrieve it from the api
      this.userReviews = this.courseReviewsService.getSellerCourseReviews(this.course.sellerUid);

      // calc avg rating for this user
      this.avgRating = this.userReviews.pipe(map(arr => {
        const ratings = arr.map(v => v.starValue);
        return ratings.length ? ratings.reduce((total, val) => total + val) / arr.length : 'No reviews yet';
      }));

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.userReviews.subscribe(data => {
            if (data) {
              this.transferState.set(REVIEWS_KEY, data as any);
            }
          })
        );
      }

    } else { // if reviews state data exists retrieve it from the state storage
      this.userReviews = reviewsData;
      console.log('Reviews data for user:', reviewsData);
      this.transferState.remove(REVIEWS_KEY);
    }
  }

  fetchSellerCourseEnrollmentsData() {
    const ENROLLMENTS_KEY = makeStateKey<any>('enrollments'); // create a key for saving/retrieving state

    const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

    if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
      this.sellerEnrollments = this.dataService.getTotalPublicEnrollmentsByCourseSeller(this.course.sellerUid);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerEnrollments.subscribe(data => {
            if (data) {
              this.transferState.set(ENROLLMENTS_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerEnrollments = enrollmentsData;
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
