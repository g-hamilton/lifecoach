import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
import { StorageService } from 'app/services/storage.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';

@Component({
  selector: 'app-program-landing-page',
  templateUrl: './program-landing-page.component.html',
  styleUrls: ['./program-landing-page.component.scss']
})
export class ProgramLandingPageComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() userId: string;
  @Input() program: CoachingProgram;

  @Output() goNextEvent = new EventEmitter<any>();

  public browser: boolean;
  public viewLoaded: boolean;

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
  public learningPointsMax = 6; // max number of program learning points allowed

  public requirementsMaxLength = 120;
  public requirementsMax = 6; // max number of program requirements allowed

  public targetsMaxLength = 120;
  public targetsMax = 6; // max number of program target students allowed

  public saving: boolean;
  public saveAttempt: boolean;
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  public specialities: any;
  public languages: any;

  public videoSources = [] as any;

  public errorMessages = {
    title: {
      minlength: `Your program title should be at least ${this.titleMinLength} characters.`,
      maxlength: `Your program title should be at less than ${this.titleMaxLength} characters.`,
      required: 'Please enter a program title.'
    },
    subtitle: {
      minlength: `Your program sub-title should be at least ${this.subTitleMinLength} characters.`,
      maxlength: `Your program sub-title should be at less than ${this.subTitleMaxLength} characters.`,
      required: 'Please enter a program sub-title.'
    },
    description: {
      required: 'Please enter a program description.'
    },
    language: {
      required: 'Please select a program language.'
    },
    category: {
      required: 'Please select the closest matching program category.'
    },
    subject: {
      minlength: `This summary should be at least ${this.subjectMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.subjectMaxLength} characters.`,
      required: 'Please be specific about what your program is about.'
    },
    image: {
      required: 'Please upload a cover image'
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

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private specialitiesService: CoachingSpecialitiesService,
    private languagesService: IsoLanguagesService,
    private storageService: StorageService,
    private cloudFunctions: CloudFunctionsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildLandingForm();
      this.specialities = this.specialitiesService.getSpecialityList();
      this.languages = this.languagesService.getLanguagesJson();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  ngOnChanges() {
    if (this.program) {
      this.importProgramData();
    }
  }

  buildLandingForm() {
    this.landingForm = this.formBuilder.group({
      programId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      subtitle: ['', [Validators.required, Validators.minLength(this.subTitleMinLength), Validators.maxLength(this.subTitleMaxLength)]],
      description: ['', [Validators.required]],
      language: [null, [Validators.required]],
      category: [null, [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(this.subjectMinLength), Validators.maxLength(this.subjectMaxLength)]],
      imageOption: [null, [Validators.required]],
      image: [null, [this.conditionallyRequiredValidator]],
      imagePaths: [null],
      promoVideo: [null],
      learningPoints: [this.formBuilder.array([])],
      requirements: [this.formBuilder.array([])],
      targets: [this.formBuilder.array([])],
      includeInCoachingForCoaches: [false]
    });
  }

  importProgramData() {
    this.landingForm.patchValue({
      programId: this.program.programId,
      title: this.program.title ? this.program.title : '',
      subtitle: this.program.subtitle ? this.program.subtitle : '',
      description: this.program.description ? this.program.description : '',
      language: this.program.language ? this.program.language : 'en',
      category: this.program.category ? this.program.category : null,
      subject: this.program.subject ? this.program.subject : '',
      imageOption: this.program.imageOption ? this.program.imageOption : 'upload',
      image: this.program.image ? this.program.image : null,
      imagePaths: this.program.imagePaths ? this.program.imagePaths : null,
      promoVideo: this.program.promoVideo ? this.program.promoVideo : null,
      learningPoints: this.program.learningPoints ? this.loadLpoints() : this.formBuilder.array([], Validators.maxLength(this.learningPointsMax)),
      requirements: this.program.requirements ? this.loadRequirements() : this.formBuilder.array([], Validators.maxLength(this.requirementsMax)),
      targets: this.program.targets ? this.loadTargets() : this.formBuilder.array([], Validators.maxLength(this.targetsMax)),
      includeInCoachingForCoaches : this.program.includeInCoachingForCoaches ? this.program.includeInCoachingForCoaches : false
    });
    // init the character counts (before user input detected)
    this.titleActualLength = this.landingF.title.value.length;
    this.subTitleActualLength = this.landingF.subtitle.value.length;
    this.subjectActualLength = this.landingF.subject.value.length;
  }

  // https://medium.com/ngx/3-ways-to-implement-conditional-validation-of-reactive-forms-c59ed6fc3325
  conditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('imageOption').value === 'upload') {
      return Validators.required(formControl);
    }
    return null;
  }

  loadLpoints() {
    const lpArray = this.formBuilder.array([], Validators.maxLength(this.learningPointsMax));
    this.program.learningPoints.forEach(lp => {
      lpArray.push(new FormControl(lp, Validators.maxLength(this.learningPointsMaxLength)));
    });
    return lpArray;
  }

  addLearningPoint() {
    const control = new FormControl('', Validators.maxLength(this.learningPointsMaxLength));
    this.landingF.learningPoints.value.controls.push(control);
  }

  deleteLearningPoint(index: number) {
    this.landingF.learningPoints.value.controls.splice(index, 1);
  }

  loadRequirements() {
    const reqArray = this.formBuilder.array([], Validators.maxLength(this.requirementsMax));
    this.program.requirements.forEach(req => {
      reqArray.push(new FormControl(req, Validators.maxLength(this.requirementsMaxLength)));
    });
    return reqArray;
  }

  addRequirement() {
    const control = new FormControl('', Validators.maxLength(this.requirementsMaxLength));
    this.landingF.requirements.value.controls.push(control);
  }

  deleteRequirement(index: number) {
    this.landingF.requirements.value.controls.splice(index, 1);
  }

  loadTargets() {
    const targetArray = this.formBuilder.array([], Validators.maxLength(this.targetsMax));
    this.program.targets.forEach(target => {
      targetArray.push(new FormControl(target, Validators.maxLength(this.targetsMaxLength)));
    });
    return targetArray;
  }

  addTarget() {
    const control = new FormControl('', Validators.maxLength(this.targetsMaxLength));
    this.landingF.targets.value.controls.push(control);
  }

  deleteTarget(index: number) {
    this.landingF.targets.value.controls.splice(index, 1);
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

  onPromoVideoUploadEvent(event: any) {
    // event should be a promo video object. We can now save this into the program object.
    console.log('Promo video uploaded event:', event);
    this.landingForm.patchValue({
      promoVideo: event
    });
    this.videoSources = []; // reset
    this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
      src: event.downloadURL
    });
  }

  onPictureUpload(event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen file when
      an image is chosen. We'll listen for that change here and grab the
      selected file for saving to storage & patching into our form control.
    */
    console.log(`Patching base64 cover image into form data`);
    this.landingForm.patchValue({
      image: event
    });
    this.analyticsService.uploadCourseImage();
  }

  async onImageOptionChange(ev: any) {
    // if account stripe id continue otherwise divert to setup stripe first
    if (ev.target.value === 'pro') {
      console.log('Pro image selected');
      this.landingF.image.setErrors(null); // manually remove the error if it has already been triggered by previous save
    } else {
      console.log('Self upload image selected');
    }
  }

  onIncludeInCoachingForCoachesToggle(ev: any) {
    this.landingForm.patchValue({includeInCoachingForCoaches: ev.currentValue});
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
    this.saveAttempt = true;
    this.saving = true;

    // safety checks

    if (this.landingForm.invalid) {
      console.log(this.landingForm.value);
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save data.');
      this.saving = false;
      return;
    }

    // Handle image upload to storage if required.
    if (this.landingF.image.value && !this.landingF.image.value.includes(this.storageService.getStorageDomain())) {
      console.log(`Uploading unstored image to storage...`);

      const imagePaths = await this.cloudFunctions
        .uploadProgramImage({uid: this.userId, img: this.landingF.image.value})
        .catch(e => console.log(e));

      // @ts-ignore
      const url = await imagePaths.original.fullSize || '';
      console.log(`Img stored successfully. Patching landing form with img download URL: ${url}`);
      this.landingForm.patchValue({
        image: url,
        imagePaths: await imagePaths // should replace image field in future
      });
      console.log('IMAGE PATHS PATCHED');
    }

    // Merge landing form data into program data & save the program object
    this.program.title = this.landingF.title.value;
    this.program.subtitle = this.landingF.subtitle.value;
    this.program.description = this.landingF.description.value;
    this.program.language = this.landingF.language.value;
    this.program.category = this.landingF.category.value;
    this.program.subject = this.landingF.subject.value;
    this.program.imageOption = this.landingF.imageOption.value;
    this.program.image = this.landingF.image.value;
    this.program.imagePaths = this.landingF.imagePaths.value;
    this.program.promoVideo = this.landingF.promoVideo.value;
    this.program.learningPoints = this.buildLpArray();
    this.program.requirements = this.buildReqArray();
    this.program.targets = this.buildTargetArray();

    // console.log(this.outlineForm.value);
    // console.log('Saving program:', this.program);

    await this.dataService.savePrivateProgram(this.userId, this.program);

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editProgramLanding();
  }

  async saveProgress() {
    await this.onSubmit(); // attempt to save
    this.alertService.alert('auto-close', 'Success!', 'Changes saved.');
  }

  async goNext() {
    await this.onSubmit(); // attempt to autosave
    if (this.landingForm.invalid) {
      return;
    }
    // safe to proceed to next tab so emit the event to the parent component
    this.goNextEvent.emit(1); // emit zero indexed tab id number
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
