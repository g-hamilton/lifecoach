import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { CourseReview } from 'app/interfaces/course-review';
import { ProgramReview } from 'app/interfaces/program-review';
import { DataService } from 'app/services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { ReviewsService } from 'app/services/reviews.service';
import { ServiceReview } from 'app/interfaces/service.review.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';


@Component({
  selector: 'app-coach-mini-profile',
  templateUrl: './coach-mini-profile.component.html',
  styleUrls: ['./coach-mini-profile.component.scss']
})
export class CoachMiniProfileComponent implements OnInit, OnChanges, OnDestroy {

  @Input() coachId: string;

  public coachProfile: CoachProfile;

  private subscriptions: Subscription = new Subscription();

  public courseReviews: CourseReview[];
  public programReviews: ProgramReview[];
  public serviceReviews: ServiceReview[];
  public avgCourseRating: number;
  public avgProgramRating: number;
  public avgServiceRating: number;
  public sellerCourseEnrollments: number;
  public sellerProgramEnrollments: number;
  public sellerServiceEnrollments: number;
  public sellerCourses: Observable<CoachingCourse[]>;
  public sellerPrograms: Observable<CoachingProgram[]>;
  public sellerServices: Observable<CoachingService[]>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private transferState: TransferState,
    private dataService: DataService,
    private reviewsService: ReviewsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.coachId) {
      this.fetchCoachProfile();
      this.fetchCourseReviewsData();
      this.fetchProgramReviewsData();
      this.fetchServiceReviewsData();
      // this.fetchSellerCourseEnrollmentsData();
      // this.fetchSellerProgramEnrollmentsData();
      // this.fetchSellerServiceEnrollmentsData();
      this.fetchSellerCoursesData();
      this.fetchSellerProgramsData();
      this.fetchSellerServicesData();
    }
  }

  fetchCoachProfile() {
    const COACH_KEY = makeStateKey<any>('coach-profile'); // create a key for saving/retrieving state

    const coachData = this.transferState.get(COACH_KEY, null as any); // checking if data in the storage exists

    if (coachData === null) { // if state data does not exist - retrieve it from the api

      // get this coach's profile
      this.subscriptions.add(
        this.dataService.getPublicCoachProfile(this.coachId).subscribe(data => {
          if (data) {
            this.coachProfile = data;
            if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
            this.transferState.set(COACH_KEY, this.coachProfile);
          }
          }
        })
      );

    } else { // if reviews state data exists retrieve it from the state storage
      this.coachProfile = coachData;
      this.transferState.remove(COACH_KEY);
    }
  }

  fetchCourseReviewsData() {
    const REVIEWS_KEY = makeStateKey<any>('course-reviews'); // create a key for saving/retrieving state

    const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

    if (reviewsData === null) { // if state data does not exist - retrieve it from the api

      // get this coach's course reviews
      this.subscriptions.add(
        this.reviewsService.getSellerCourseReviews(this.coachId).subscribe(data => {
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
        this.reviewsService.getSellerProgramReviews(this.coachId).subscribe(data => {
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

  fetchServiceReviewsData() {
    const REVIEWS_KEY = makeStateKey<any>('service-reviews'); // create a key for saving/retrieving state

    const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

    if (reviewsData === null) { // if state data does not exist - retrieve it from the api

      // get this coach's service reviews
      this.subscriptions.add(
        this.reviewsService.getSellerServiceReviews(this.coachId).subscribe(data => {
          this.serviceReviews = data;

          // calc avg rating for this coach's services
          const ratings = this.serviceReviews.map(v => v.starValue);
          this.avgServiceRating = ratings.length ? ratings.reduce((total, val) => total + val) / ratings.length : null;

          if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
            this.transferState.set(REVIEWS_KEY, this.serviceReviews);
          }
        })
      );

    } else { // if reviews state data exists retrieve it from the state storage
      this.programReviews = reviewsData;
      // console.log('Program reviews data for user:', reviewsData);
      this.transferState.remove(REVIEWS_KEY);
    }
  }

  // async fetchSellerCourseEnrollmentsData() {
  //   const ENROLLMENTS_KEY = makeStateKey<any>('course-enrollments'); // create a key for saving/retrieving state

  //   const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

  //   if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
  //     this.sellerCourseEnrollments = await this.dataService.getTotalPublicEnrollmentsByCourseSeller(this.coachId);

  //     if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
  //       this.transferState.set(ENROLLMENTS_KEY, this.sellerCourseEnrollments);
  //     }

  //   } else { // if state data exists retrieve it from the state storage
  //     this.sellerCourseEnrollments = enrollmentsData;
  //     this.transferState.remove(ENROLLMENTS_KEY);
  //   }
  // }

  // async fetchSellerProgramEnrollmentsData() {
  //   const ENROLLMENTS_KEY = makeStateKey<any>('program-enrollments'); // create a key for saving/retrieving state

  //   const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

  //   if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
  //     this.sellerProgramEnrollments = await this.dataService.getTotalPublicProgramEnrollmentsBySeller(this.coachId);

  //     if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
  //       this.transferState.set(ENROLLMENTS_KEY, this.sellerProgramEnrollments);
  //     }

  //   } else { // if state data exists retrieve it from the state storage
  //     this.sellerProgramEnrollments = enrollmentsData;
  //     this.transferState.remove(ENROLLMENTS_KEY);
  //   }
  // }

  // async fetchSellerServiceEnrollmentsData() {
  //   const ENROLLMENTS_KEY = makeStateKey<any>('service-enrollments'); // create a key for saving/retrieving state

  //   const enrollmentsData = this.transferState.get(ENROLLMENTS_KEY, null as any); // checking if data in the storage exists

  //   if (enrollmentsData === null) { // if state data does not exist - retrieve it from the api
  //     this.sellerServiceEnrollments = await this.dataService.getTotalPublicServiceEnrollmentsBySeller(this.coachId);

  //     if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
  //       this.transferState.set(ENROLLMENTS_KEY, this.sellerServiceEnrollments);
  //     }

  //   } else { // if state data exists retrieve it from the state storage
  //     this.sellerServiceEnrollments = enrollmentsData;
  //     this.transferState.remove(ENROLLMENTS_KEY);
  //   }
  // }

  fetchSellerCoursesData() {
    const COURSES_KEY = makeStateKey<any>('courses'); // create a key for saving/retrieving state

    const coursesData = this.transferState.get(COURSES_KEY, null as any); // checking if data in the storage exists

    if (coursesData === null) { // if state data does not exist - retrieve it from the api
      this.sellerCourses = this.dataService.getPublicCoursesBySeller(this.coachId);

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
      this.sellerPrograms = this.dataService.getPublicProgramsBySeller(this.coachId);

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

  fetchSellerServicesData() {
    const SERVICES_KEY = makeStateKey<any>('services'); // create a key for saving/retrieving state

    const servicesData = this.transferState.get(SERVICES_KEY, null as any); // checking if data in the storage exists

    if (servicesData === null) { // if state data does not exist - retrieve it from the api
      this.sellerServices = this.dataService.getPublicServicesBySeller(this.coachId);

      if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
        this.subscriptions.add(
          this.sellerServices.subscribe(data => {
            if (data) {
              this.transferState.set(SERVICES_KEY, data as any);
            }
          })
        );
      }

    } else { // if state data exists retrieve it from the state storage
      this.sellerServices = servicesData;
      this.transferState.remove(SERVICES_KEY);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
