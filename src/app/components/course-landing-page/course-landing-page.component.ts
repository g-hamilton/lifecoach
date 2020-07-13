import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { CoachingCourse, CoachingCourseResource } from 'app/interfaces/course.interface';

import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { IsoLanguagesService } from 'app/services/iso-languages.service';

@Component({
  selector: 'app-course-landing-page',
  templateUrl: './course-landing-page.component.html',
  styleUrls: ['./course-landing-page.component.scss']
})
export class CourseLandingPageComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  public browser: boolean;

  public specialities: any;
  public languages: any;

  public landingForm: FormGroup;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;

  public titleMinLength = 10;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  public subTitleMinLength = 20;
  public subTitleMaxLength = 120;
  public subTitleActualLength = 0;

  public subjectMinLength = 6;
  public subjectMaxLength = 120;
  public subjectActualLength = 0;

  public learningPointsMaxLength = 120;
  public learningPointsMax = 6; // max number of course learning points allowed

  public requirementsMaxLength = 120;
  public requirementsMax = 6; // max number of course requirements allowed

  public targetsMaxLength = 120;
  public targetsMax = 6; // max number of course target students allowed

  public errorMessages = {
    title: {
      minlength: `Your course title should be at least ${this.titleMinLength} characters.`,
      maxlength: `Your course title should be at less than ${this.titleMaxLength} characters.`,
      required: 'Please enter a course title.'
    },
    subtitle: {
      minlength: `Your course sub-title should be at least ${this.subTitleMinLength} characters.`,
      maxlength: `Your course sub-title should be at less than ${this.subTitleMaxLength} characters.`,
      required: 'Please enter a course sub-title.'
    },
    description: {
      required: 'Please enter a course description.'
    },
    language: {
      required: 'Please select a course language.'
    },
    category: {
      required: 'Please select the closest matching course category.'
    },
    level: {
      required: 'Please select an appropriate level for your course.'
    },
    subject: {
      minlength: `This summary should be at least ${this.subjectMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.subjectMaxLength} characters.`,
      required: 'Please be specific about what your course is about.'
    },
    learningPoints: {
      maxlength: `Key learning points should be at less than ${this.learningPointsMaxLength} characters.`
    },
    requirements: {
      maxlength: `Requirements should be at less than ${this.requirementsMaxLength} characters.`
    },
    targets: {
      maxlength: `Target student descriptions should be at less than ${this.targetsMaxLength} characters.`
    }
  };

  public saving: boolean;

  public objKeys = Object.keys;

  public videoSources = [] as any;

  public viewLoaded: boolean;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private storageService: StorageService,
    private specialitiesService: CoachingSpecialitiesService,
    private languagesService: IsoLanguagesService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildLandingForm();
      this.specialities = this.specialitiesService.getSpecialityList();
      this.languages = this.languagesService.getLanguagesJson();
    }
  }

  ngOnChanges() {
    if (this.course) {
      this.importCourseData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  buildLandingForm() {
    this.landingForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      subtitle: ['', [Validators.required, Validators.minLength(this.subTitleMinLength), Validators.maxLength(this.subTitleMaxLength)]],
      description: ['', [Validators.required]],
      language: ['', [Validators.required]],
      category: ['', [Validators.required]],
      level: ['', [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(this.subjectMinLength), Validators.maxLength(this.subjectMaxLength)]],
      mainImage: [null],
      promoVideo: [null],
      learningPoints: [this.formBuilder.array([])],
      requirements: [this.formBuilder.array([])],
      targets: [this.formBuilder.array([])]
    });
  }

  importCourseData() {
    this.landingForm.patchValue({
      courseId: this.course.courseId,
      title: this.course.title ? this.course.title : '',
      subtitle: this.course.subtitle ? this.course.subtitle : '',
      description: this.course.description ? this.course.description : '',
      language: this.course.language ? this.course.language : 'en',
      category: this.course.category ? this.course.category : '',
      level: this.course.level ? this.course.level : '',
      subject: this.course.subject ? this.course.subject : '',
      mainImage: this.course.image ? this.course.image : null,
      promoVideo: this.course.promoVideo ? this.course.promoVideo : null,
      // tslint:disable-next-line: max-line-length
      learningPoints: this.course.learningPoints ? this.loadLpoints() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.learningPointsMaxLength))], Validators.maxLength(this.learningPointsMax)),
      // tslint:disable-next-line: max-line-length
      requirements: this.course.requirements ? this.loadRequirements() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.requirementsMaxLength))], Validators.maxLength(this.requirementsMax)),
      // tslint:disable-next-line: max-line-length
      targets: this.course.targets ? this.loadTargets() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.targetsMaxLength))], Validators.maxLength(this.targetsMax))
    });

    if (this.course.promoVideo) {
      this.videoSources = []; // reset
      this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
        src: this.course.promoVideo.downloadURL
      });
    }

    this.titleActualLength = this.landingF.title.value.length;
    this.subTitleActualLength = this.landingF.subtitle.value.length;
    this.subjectActualLength = this.landingF.subject.value.length;
  }

  loadLpoints() {
    const lpArray = this.formBuilder.array([], Validators.maxLength(this.learningPointsMax));
    this.course.learningPoints.forEach(lp => {
      lpArray.push(new FormControl(lp, Validators.maxLength(this.learningPointsMaxLength)));
    });
    return lpArray;
  }

  addLearningPoint() {
    const control = new FormControl('', Validators.maxLength(this.learningPointsMaxLength));
    this.landingF.learningPoints.value.controls.push(control);
  }

  loadRequirements() {
    const reqArray = this.formBuilder.array([], Validators.maxLength(this.requirementsMax));
    this.course.requirements.forEach(req => {
      reqArray.push(new FormControl(req, Validators.maxLength(this.requirementsMaxLength)));
    });
    return reqArray;
  }

  addRequirement() {
    const control = new FormControl('', Validators.maxLength(this.requirementsMaxLength));
    this.landingF.requirements.value.controls.push(control);
  }

  loadTargets() {
    const targetArray = this.formBuilder.array([], Validators.maxLength(this.targetsMax));
    this.course.targets.forEach(target => {
      targetArray.push(new FormControl(target, Validators.maxLength(this.targetsMaxLength)));
    });
    return targetArray;
  }

  addTarget() {
    const control = new FormControl('', Validators.maxLength(this.targetsMaxLength));
    this.landingF.targets.value.controls.push(control);
  }

  get landingF(): any {
    return this.landingForm.controls;
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

  onSubTitleInput(ev: any) {
    this.subTitleActualLength = (ev.target.value as string).length;
  }

  onSubjectInput(ev: any) {
    this.subjectActualLength = (ev.target.value as string).length;
  }

  onPictureUpload(event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen file when
      an image is chosen. We'll listen for that change here and grab the
      selected file for saving to storage & patching into our form control.
    */
    console.log(`Updating main course image with: ${event}`);
    this.landingForm.patchValue({
      mainImage: event
    });
    this.analyticsService.uploadCourseImage();
  }

  onPromoVideoUploadEvent(event: any) {
    // event should be a promo video object. We can now save this into the course object.
    console.log('Promo video uploaded event:', event);
    this.landingForm.patchValue({
      promoVideo: event
    });
    this.videoSources = []; // reset
    this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
      src: event.downloadURL
    });
  }

  onLibraryItemSelect(event: CoachingCourseResource) {
    // TODO check file is a video!
    console.log('Item selected from library:', event);
    this.landingForm.patchValue({
      promoVideo: event
    });
    this.videoSources = []; // reset
    this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
      src: event.downloadURL
    });
  }

  buildLpArray() {
    const arr = [];
    (this.landingF.learningPoints.value as FormArray).controls.forEach(control => {
      if (control.errors) {
        return;
      }
      arr.push(control.value);
    });
    if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
      return null;
    }
    return arr;
  }

  buildReqArray() {
    const arr = [];
    (this.landingF.requirements.value as FormArray).controls.forEach(control => {
      if (control.errors) {
        return;
      }
      arr.push(control.value);
    });
    if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
      return null;
    }
    return arr;
  }

  buildTargetArray() {
    const arr = [];
    (this.landingF.targets.value as FormArray).controls.forEach(control => {
      if (control.errors) {
        return;
      }
      arr.push(control.value);
    });
    if (arr.length === 0 || (arr.length === 1 && arr[0] === '')) {
      return null;
    }
    return arr;
  }

  async onSubmit() {
    this.saving = true;

    // safety checks
    if (!this.landingF.title.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a course title.');
      this.saving = false;
      return;
    }
    if (!this.landingF.subtitle.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a course subtitle.');
      this.saving = false;
      return;
    }
    if (!this.landingF.description.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a course description.');
      this.saving = false;
      return;
    }
    if (!this.landingF.language.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please select a course language.');
      this.saving = false;
      return;
    }
    if (!this.landingF.category.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please select a course category.');
      this.saving = false;
      return;
    }
    if (!this.landingF.level.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please select a course level.');
      this.saving = false;
      return;
    }
    if (!this.landingF.subject.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a primary subject.');
      this.saving = false;
      return;
    }

    // catch all fallback
    if (this.landingForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save landing page data');
      this.saving = false;
      return;
    }

    // Handle image upload to storage if required.
    if (this.landingF.mainImage.value && !this.landingF.mainImage.value.includes(this.storageService.getStorageDomain())) {
      console.log(`Uploading unstored course photo to storage...`);
      const url = await this.storageService.storeCourseImageUpdateDownloadUrl(this.userId, this.landingF.mainImage.value);
      console.log(`Photo stored successfully. Patching landing form with photo download URL: ${url}`);
      this.landingForm.patchValue({
        mainImage: url
      });
    }

    // Merge landing form data into course data & save the course object
    this.course.title = this.landingF.title.value;
    this.course.subtitle = this.landingF.subtitle.value;
    this.course.description = this.landingF.description.value;
    this.course.language = this.landingF.language.value;
    this.course.category = this.landingF.category.value;
    this.course.level = this.landingF.level.value;
    this.course.subject = this.landingF.subject.value;
    this.course.image = this.landingF.mainImage.value;
    this.course.promoVideo = this.landingF.promoVideo.value;
    this.course.learningPoints = this.buildLpArray();
    this.course.requirements = this.buildReqArray();
    this.course.targets = this.buildTargetArray();

    // console.log(this.course);

    await this.dataService.savePrivateCourse(this.userId, this.course);

    this.alertService.alert('auto-close', 'Success!', 'Course saved.');

    this.saving = false;

    this.analyticsService.editCourseLandingPage();
  }
}
