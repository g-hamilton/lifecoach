import { Component, OnInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { UserAccount } from 'app/interfaces/user.account.interface';
import { CoachingCourse, CoachingCourseSection, CoachingCourseLecture } from 'app/interfaces/course.interface';

import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.scss']
})
export class NewCourseComponent implements OnInit {

  @Input() userId: string;
  @Input() account: UserAccount;

  public browser: boolean;

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

  public objKeys = Object.keys;

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

  buildCourseForm() {
    this.newCourseForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]]
    });
  }

  get courseF(): any {
    return this.newCourseForm.controls;
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
    // Safety checks
    if (this.newCourseForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Invalid form.');
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing UID.');
      return;
    }
    if (!this.account) {
      this.alertService.alert('warning-message', 'Oops', 'Missing account data.');
      return;
    }

    // Prepare the new course object
    const courseId = Math.random().toString(36).substr(2, 9); // generate semi-random id
    const newCourse = {
      courseId,
      sellerUid: this.userId,
      stripeId: this.account.stripeUid ? this.account.stripeUid : null,
      title: this.courseF.title.value,
      sections: [] as CoachingCourseSection[],
      lectures: [] as CoachingCourseLecture[]
    } as CoachingCourse;

    // Save the new course to the db
    await this.dataService.savePrivateCourse(this.userId, newCourse);

    // Navigate to continue
    this.router.navigate(['/my-courses', courseId, 'content', 'section', 'new'], { queryParams: { targetUser: this.userId }});
  }

}
