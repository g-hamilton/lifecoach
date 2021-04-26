import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { DataService } from 'app/services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { TestimonialsService } from 'app/services/testimonials.service';
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

  public sellerCourses: Observable<CoachingCourse[]>;
  public sellerPrograms: Observable<CoachingProgram[]>;
  public sellerServices: Observable<CoachingService[]>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private transferState: TransferState,
    private dataService: DataService,
    private testimonialsService: TestimonialsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.coachId) {
      this.fetchCoachProfile();
      this.fetchSellerCoursesData();
      this.fetchSellerProgramsData();
      this.fetchSellerServicesData();
      this.fetchCoachTestimonials();
      this.fetchCoachTotalClients();
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

  fetchCoachTestimonials() {
    // todo!
  }

  fetchCoachTotalClients() {
    // todo!
  }

  // fetchCourseReviewsData() {
  //   const REVIEWS_KEY = makeStateKey<any>('course-reviews'); // create a key for saving/retrieving state

  //   const reviewsData = this.transferState.get(REVIEWS_KEY, null as any); // checking if data in the storage exists

  //   if (reviewsData === null) { // if state data does not exist - retrieve it from the api

  //     // get this coach's course reviews
  //     this.subscriptions.add(
  //       this.reviewsService.getSellerCourseReviews(this.coachId).subscribe(data => {
  //         this.courseReviews = data;

  //         // calc avg rating for this coach's courses
  //         const ratings = this.courseReviews.map(v => v.starValue);
  //         this.avgCourseRating = ratings.length ? ratings.reduce((total, val) => total + val) / ratings.length : null;

  //         if (isPlatformServer(this.platformId)) { // if we're server side, store the retrieved data as a state
  //           this.transferState.set(REVIEWS_KEY, this.courseReviews);
  //         }
  //       })
  //     );

  //   } else { // if reviews state data exists retrieve it from the state storage
  //     this.courseReviews = reviewsData;
  //     // console.log('Course reviews data for user:', reviewsData);
  //     this.transferState.remove(REVIEWS_KEY);
  //   }
  // }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
