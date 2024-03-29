import { Component, OnInit, Inject, PLATFORM_ID, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { CoachingCourse, CoachingCourseSection, CoachingCourseLecture } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})
export class NewCourseComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() account: UserAccount;

  public browser: boolean;
  private userProfile: CoachProfile;

  public newCourseForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public titleMinLength = 10;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  public errorMessages = {
    title: {
      minlength: `Your title should be at least ${this.titleMinLength} characters.`,
      maxlength: `Your title should be at less than ${this.titleMaxLength} characters.`
    }
  };

  public saving: boolean;
  public saveAttempt: boolean;

  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildCourseForm();
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.userId && !this.userProfile) {
        this.loadUserProfile(); // background load the user profile so we can save user data into new course object
      }
    }
  }

  buildCourseForm() {
    this.newCourseForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]]
    });
  }

  get courseF(): any {
    return this.newCourseForm.controls;
  }

  loadUserProfile() {
    // By now the user should have a public profile.
    // Program creation should not be allowed until they do.
    this.subscriptions.add(
      this.dataService.getPublicCoachProfile(this.userId).subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          // console.log('Fetched profile:', profile);
        }
      })
    );
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onTitleInput(ev: any) {
    this.titleActualLength = (ev.target.value as string).length;
  }

  async onSubmit() {
    this.saveAttempt = true;
    this.saving = true;

    // Safety checks
    if (this.newCourseForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all fields to continue.');
      this.saving = false;
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing UID. Please contact support.');
      this.saving = false;
      return;
    }
    if (!this.account) {
      this.alertService.alert('warning-message', 'Oops', 'Missing account data. Please contact support.');
      this.saving = false;
      return;
    }
    if (!this.userProfile || !this.userProfile.firstName || !this.userProfile.lastName || !this.userProfile.photo) {
      this.alertService.alert('warning-message', 'Oops', 'Missing public profile data. Please try again or contact support.');
      this.saving = false;
      return;
    }

    // Prepare the new course object
    const courseId = Math.random().toString(36).substr(2, 9); // generate semi-random id
    const newCourse = {
      courseId,
      sellerUid: this.userId,
      stripeId: this.account.stripeUid ? this.account.stripeUid : null, // can be null to allow users to create free ecourses
      title: this.courseF.title.value,
      sections: [] as CoachingCourseSection[],
      lectures: [] as CoachingCourseLecture[],
      coachName: `${this.userProfile.firstName} ${this.userProfile.lastName}`,
      coachPhoto: this.userProfile.photo
    } as CoachingCourse;

    // Save the new course to the db
    await this.dataService.savePrivateCourse(this.userId, newCourse);

    this.saving = false;
    this.saveAttempt = false;

    // Navigate to continue
    this.router.navigate(['/my-courses', courseId, 'content', 'section', 'new'], { queryParams: { targetUser: this.userId }});
  }

  cancel() {
    this.router.navigate(['/coach-products-services']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
