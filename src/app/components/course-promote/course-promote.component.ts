import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-course-promote',
  templateUrl: './course-promote.component.html',
  styleUrls: ['./course-promote.component.scss']
})
export class CoursePromoteComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  public browser: boolean;

  public promoteForm: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildPromoteForm();
    }
  }

  ngOnChanges() {
    if (this.userId && this.course) {
      const baseUrl = `${environment.baseUrl}/course/${this.course.courseId}`;
      const queryparams = `?referralCode=${this.userId}`;
      this.promoteForm.patchValue({ referralCode: `${baseUrl}${queryparams}` });
    }
  }

  buildPromoteForm() {
    this.promoteForm = this.formBuilder.group({
      referralCode: ['', [Validators.required]]
    });
  }

  get promoteF(): any {
    return this.promoteForm.controls;
  }

  copyReferralCode(element: any) {
    // Copy to the clipboard.
    // Note: Don't try this in SSR environment unless injecting document!
    // console.log('copy clicked', element);
    element.select();
    document.execCommand('copy');
    element.setSelectionRange(0, 0);
    this.alertService.alert('auto-close', 'Copied!', 'Link copied to clipboard.');
  }

}
