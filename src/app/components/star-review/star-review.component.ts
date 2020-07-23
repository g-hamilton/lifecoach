import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CourseReviewsService } from 'app/services/course-reviews.service';
import { DataService } from 'app/services/data.service';
import { CourseReview } from 'app/interfaces/course-review';
import { SearchService } from 'app/services/search.service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-star-review',
  templateUrl: './star-review.component.html',
  styleUrls: ['./star-review.component.scss']
})
export class StarReviewComponent implements OnInit {

  @Input() userId: string;
  @Input() course: CoachingCourse;
  @Input() uniqueComponentString: string; // allows us to use this component more than once in same parent without unique ID DOM errors

  @Output() savedRatingEvent = new EventEmitter<boolean>();

  private courseId: string;
  public reviewForm: FormGroup;
  private userProfile: any;

  private previewAsStudent: boolean;

  constructor(
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private courseReviewService: CourseReviewsService,
    private dataService: DataService,
    private searchService: SearchService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.buildReviewForm();

    if (this.course) {
      this.courseId = this.course.courseId;
      this.updateReviewForm();
    } else {
      this.route.params.subscribe(params => {
        this.courseId = params.courseId;
        this.updateReviewForm();
      });
    }

    if (this.userId) {
      // user could be coach or regular. try coach first...
      this.fetchCoachProfile();
    }

    // Are we a course creator previewing own course as a student?
    this.route.queryParams.subscribe(qp => {
      if (qp.previewAsStudent) {
        this.previewAsStudent = true;
      }
    });
  }

  buildReviewForm() {
    this.reviewForm = this.formBuilder.group(
      {
        rating: 0,
        summary: null
      }
    );
  }

  async updateReviewForm() {
    if (this.courseId) {
      // search user review for this course to check for previous saved review data
      // filter to only include reviews for this course from this user (should only ever be 1)
      const filters = { query: null, facets: { courseId: this.courseId, reviewerUid: this.userId } };
      const res = await this.searchService.searchCourseReviews(1, 1, filters);
      // console.log(res.hits);
      const savedReview = res.hits[0];
      if (savedReview) { // there is a saved review, so load data
        this.reviewForm.patchValue({
          rating: savedReview.starValue,
          summary: savedReview.summary ? savedReview.summary : null
        });
      }
    }
  }

  onRatingChange(value: number) {
    // console.log(value);
    this.reviewForm.patchValue({ rating: value });
  }

  fetchCoachProfile() {
    const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
      // console.log('coach profile:', coachProfile);
      if (coachProfile) {
        this.userProfile = coachProfile;
      } else { // user is not a coach, try regular...
        this.fetchRegularProfile();
      }
      tempSub.unsubscribe();
    });
  }

  fetchRegularProfile() {
    const tempSub = this.dataService.getRegularProfile(this.userId).subscribe(regProfile => {
      // console.log('regular profile', regProfile);
      if (regProfile) {
        this.userProfile = regProfile;
      }
      tempSub.unsubscribe();
    });
  }

  async submit() {

    if (this.previewAsStudent) {
      this.savedRatingEvent.emit(true); // show the success msg but don't save the review
      return;
    }

    // console.log(this.reviewForm.value);
    const review = this.reviewForm.value;

    // we should have user profile details at time of calling but if not we'll fall back to 'anonymous'.
    // save the user's name & photo (if we have it) into the reviews object so it remains with the review
    // even if the user deletes their account.

    console.log('User profile:', this.userProfile);

    const data: CourseReview = {
      reviewerUid: this.userId,
      reviewerFirstName: (this.userProfile && this.userProfile.firstName) ? this.userProfile.firstName : 'Anonymous',
      reviewerLastName: (this.userProfile && this.userProfile.lastName) ? this.userProfile.lastName : 'Student',
      reviewerPhoto: (this.userProfile && this.userProfile.photo) ? this.userProfile.photo : null,
      sellerUid: this.course.sellerUid,
      courseId: this.course.courseId,
      starValue: review.rating,
      summary: review.summary ? review.summary : null,
      summaryExists: review.summary ? true : false,
      lastUpdated: Math.round(new Date().getTime() / 1000)
    };

    await this.courseReviewService.setReview(data);

    this.savedRatingEvent.emit(true);
  }

}
