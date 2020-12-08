import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { CourseSectionsValidator } from 'app/custom-validators/course.sections.validator';

@Component({
  selector: 'app-course-submit',
  templateUrl: './course-submit.component.html',
  styleUrls: ['./course-submit.component.scss']
})
export class CourseSubmitComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  public browser: boolean;
  public requesting: boolean;
  public courseForm: FormGroup;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    public formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildCourseForm(); // only building for client-side submission ready validation
    }
  }

  ngOnChanges() {
    if (this.course) {
      this.importCourseData();
    }
  }

  buildCourseForm() {
    this.courseForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      subtitle: ['', [Validators.required]],
      description: ['', [Validators.required]],
      language: [null, [Validators.required]],
      category: [null, [Validators.required]],
      level: [null, [Validators.required]],
      subject: ['', [Validators.required]],
      image: [null, [Validators.required]],
      pricingStrategy: ['free', [Validators.required]],
      price: [null, [this.conditionallyRequiredPriceAndCurrencyValidator]],
      currency: ['USD', [this.conditionallyRequiredPriceAndCurrencyValidator]],
      sellerUid: ['', [Validators.required]],
      stripeId: ['', [Validators.required]],
      coachName: ['', [Validators.required]],
      coachPhoto: ['', [Validators.required]],
      sections: [null, [CourseSectionsValidator]],
      lectures: [null, [Validators.required]],
    });
  }

  importCourseData() {
    this.courseForm.patchValue({
      courseId: this.course.courseId,
      title: this.course.title,
      subtitle: this.course.subtitle,
      description: this.course.description,
      language: this.course.language,
      category: this.course.category,
      level: this.course.level,
      subject: this.course.subject,
      image: this.course.image,
      pricingStrategy: this.course.pricingStrategy,
      price: this.course.price,
      currency: this.course.currency,
      sellerUid: this.course.sellerUid,
      stripeId: this.course.stripeId,
      coachName: this.course.coachName,
      coachPhoto: this.course.coachPhoto,
      sections: this.course.sections,
      lectures: this.course.lectures,
    });
    // console.dir(this.courseForm.value);
  }

  get courseF(): any {
    return this.courseForm.controls;
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  // https://medium.com/ngx/3-ways-to-implement-conditional-validation-of-reactive-forms-c59ed6fc3325
  conditionallyRequiredPriceAndCurrencyValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('pricingStrategy').value === 'paid') {
      return Validators.required(formControl);
    }
    return null;
  }

  async onSubmit() {
    this.requesting = true;

    if (this.course.reviewRequest && this.course.reviewRequest.status === 'submitted') {
      this.requesting = false;
      this.alertService.alert('info-message', 'Just a second!', `This course has already been submitted for review.`);
      return;
    }
    if (this.course.reviewRequest && this.course.reviewRequest.status === 'in-review') {
      this.requesting = false;
      this.alertService.alert('info-message', 'Just a second!', `This course is already in review.`);
      return;
    }
    if (this.course.reviewRequest && this.course.reviewRequest.status === 'approved') {
      this.requesting = false;
      this.alertService.alert('info-message', 'Just a second!', `This course is already approved.`);
      return;
    }

    // ***** ADMIN ONLY for testing *****
    // mark course as test
    // run this locally - remember to comment out before releasing!!!
    // this.course.isTest = true;

    // request review
    await this.dataService.savePrivateCourse(this.course.sellerUid, this.course); // autosave the course now that we've added additional seller profile data
    this.dataService.requestCourseReview(this.course);
    this.dataService.completeUserTask(this.course.sellerUid, 'taskDefault003');

    this.alertService.alert('success-message', 'Success!', 'Your course is now in review!');

    this.requesting = false;

    this.analyticsService.submitCourseForReview();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
