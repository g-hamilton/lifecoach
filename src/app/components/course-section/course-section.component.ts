import { Component, OnInit, Inject, PLATFORM_ID, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { CoachingCourse, CoachingCourseSection } from 'app/interfaces/course.interface';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AnalyticsService } from 'app/services/analytics.service';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-course-section',
  templateUrl: './course-section.component.html',
  styleUrls: ['./course-section.component.scss']
})
export class CourseSectionComponent implements OnInit, OnChanges {

  @Input() isNewSection: boolean;
  @Input() activatedSectionId: string;
  @Input() course: CoachingCourse;

  public targetUserUid: string;

  public browser: boolean;

  public sectionForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public titleMinLength = 6;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  public errorMessages = {
    title: {
      minlength: `Section titles should be at least ${this.titleMinLength} characters.`,
      maxlength: `Section titles should be at less than ${this.titleMaxLength} characters.`
    }
  };

  public saving: boolean;
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.route.queryParams.subscribe(qP => {
        if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
            this.targetUserUid = qP.targetUser;
        }
      });
      this.buildSectionForm();
    }
  }

  ngOnChanges() {
    if (this.course && this.activatedSectionId) {
      this.loadSection();
    }
  }

  buildSectionForm() {
    this.sectionForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      expanded: [false],
      lectures: [[]]
    });
  }

  get sectionF(): any {
    return this.sectionForm.controls;
  }

  loadSection() {
    const matches = this.course.sections.filter(item => item.id === this.activatedSectionId);
    const section = matches[0] as CoachingCourseSection; // should only be 1 matching section id
    this.sectionForm.patchValue({
      id: section.id,
      title: section.title,
      expanded: section.expanded ? section.expanded : false,
      lectures: section.lectures ? section.lectures : []
    });
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

    // If this is a new section
    if (this.isNewSection && !this.sectionF.id.value) {
      const sectionId = Math.random().toString(36).substr(2, 9); // generate semi-random id
      this.sectionForm.patchValue({ id: sectionId }); // update form with new id
      this.sectionForm.patchValue({ expanded: true }); // auto expand new sections
    }

    // Safety checks
    if (this.sectionForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all fields to continue.');
      this.saving = false;
      return;
    }
    if (!this.course) {
      this.alertService.alert('warning-message', 'Oops', 'Missing eCourse data. Please contact support.');
      this.saving = false;
      return;
    }

    // Ensure sections array exists
    if (!this.course.sections) {
      this.course.sections = [] as CoachingCourseSection[];
    }

    // If we're creating a new section
    if (this.isNewSection) {
      // Add the section into the course object
      this.course.sections.push(this.sectionForm.value);
      this.analyticsService.createCourseSection();
    }

    // If we're editing an existing section
    if (this.activatedSectionId) {
      const i = this.course.sections.findIndex(item => item.id === this.activatedSectionId);
      if (i !== -1) {
        this.course.sections[i] = this.sectionForm.value;
      }
      this.analyticsService.editCourseSection();
    }

    // Save the course object
    const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
    await this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);

    this.saving = false;
    this.saveAttempt = false;

    // Navigate to relevant section url
    this.router.navigate(['my-courses', this.course.courseId, 'content', 'section', this.sectionF.id.value], { queryParams: { targetUser: this.targetUserUid }});
  }

}
