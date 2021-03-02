import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { IsoLanguagesService } from 'app/services/iso-languages.service';
import { StorageService } from 'app/services/storage.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { ToastService } from 'app/services/toast.service';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-landing-page.component.html',
  styleUrls: ['./service-landing-page.component.scss']
})
export class ServiceLandingPageComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() userId: string;
  @Input() service: CoachingService;

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

  public headlineMinLength = 10;
  public headlineMaxLength = 120;
  public headlineActualLength = 0;

  public subjectMinLength = 6;
  public subjectMaxLength = 120;
  public subjectActualLength = 0;

  public learningPointsMaxLength = 120;
  public learningPointsMax = 6; // max number of service learning points allowed

  public requirementsMaxLength = 120;
  public requirementsMax = 6; // max number of service requirements allowed

  public targetsMaxLength = 120;
  public targetsMax = 6; // max number of service target students allowed

  public saving: boolean;
  public saveAttempt: boolean;
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  public specialities: any;
  public languages: any;

  public videoSources = [] as any;

  public errorMessages = {
    type: {
      required: `Please select a service type.`
    },
    sessionDuration: {
      required: `Please enter a duration in minutes.`
    },
    headline: {
      minlength: `Your headline should be at least ${this.headlineMinLength} characters.`,
      maxlength: `Your headline should be at less than ${this.headlineMaxLength} characters.`,
      required: 'Please enter a service sub-title.'
    },
    description: {
      required: 'Please enter a service description.'
    },
    image: {
      required: 'Please upload a cover image'
    },
    language: {
      required: 'Please select a service language.'
    },
    category: {
      required: 'Please select the closest matching service category.'
    },
    subject: {
      minlength: `This summary should be at least ${this.subjectMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.subjectMaxLength} characters.`,
      required: 'Please be specific about what your service is about.'
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
    private cloudFunctions: CloudFunctionsService,
    private toastService: ToastService
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
    if (this.service) {
      this.importServiceData();
    }
  }

  buildLandingForm() {
    this.landingForm = this.formBuilder.group({
      serviceId: ['', [Validators.required]],
      type: [null, [Validators.required]],
      sessionDuration: [null, [Validators.required]],
      headline: ['', [Validators.required, Validators.minLength(this.headlineMinLength), Validators.maxLength(this.headlineMaxLength)]],
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

  importServiceData() {
    this.landingForm.patchValue({
      serviceId: this.service.serviceId,
      type: this.service.type ? this.service.type : 'individual',
      sessionDuration: this.service.sessionDuration ? this.service.sessionDuration : 60,
      headline: this.service.headline ? this.service.headline : this.service.subtitle ? this.service.subtitle : '', // some older services may have subtitle
      description: this.service.description ? this.service.description : '',
      language: this.service.language ? this.service.language : 'en',
      category: this.service.category ? this.service.category : null,
      subject: this.service.subject ? this.service.subject : '',
      imageOption: this.service.imageOption ? this.service.imageOption : 'upload',
      image: this.service.image ? this.service.image : null,
      imagePaths: this.service.imagePaths ? this.service.imagePaths : null,
      promoVideo: this.service.promoVideo ? this.service.promoVideo : null,
      learningPoints: this.service.learningPoints ? this.loadLpoints() : this.formBuilder.array([], Validators.maxLength(this.learningPointsMax)),
      requirements: this.service.requirements ? this.loadRequirements() : this.formBuilder.array([], Validators.maxLength(this.requirementsMax)),
      targets: this.service.targets ? this.loadTargets() : this.formBuilder.array([], Validators.maxLength(this.targetsMax)),
      includeInCoachingForCoaches : this.service.includeInCoachingForCoaches ? this.service.includeInCoachingForCoaches : false
    });
    // init the character counts (before user input detected)
    this.headlineActualLength = this.landingF.headline.value.length;
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
    this.service.learningPoints.forEach(lp => {
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
    this.service.requirements.forEach(req => {
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
    this.service.targets.forEach(target => {
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

  onHeadlineInput(ev: any) {
    this.headlineActualLength = (ev.target.value as string).length;
  }

  onSubjectInput(ev: any) {
    this.subjectActualLength = (ev.target.value as string).length;
  }

  onPromoVideoUploadEvent(event: any) {
    // event should be a promo video object. We can now save this into the service object.
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
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields to continue.');
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
        .uploadServiceImage({uid: this.userId, img: this.landingF.image.value})
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

    // Merge landing form data into service data & save the service object
    this.service.type = this.landingF.type.value;
    this.service.sessionDuration = this.landingF.sessionDuration.value;
    this.service.headline = this.landingF.headline.value;
    this.service.description = this.landingF.description.value;
    this.service.language = this.landingF.language.value;
    this.service.category = this.landingF.category.value;
    this.service.subject = this.landingF.subject.value;
    this.service.imageOption = this.landingF.imageOption.value;
    this.service.image = this.landingF.image.value;
    this.service.imagePaths = this.landingF.imagePaths.value;
    this.service.promoVideo = this.landingF.promoVideo.value;
    this.service.learningPoints = this.buildLpArray();
    this.service.requirements = this.buildReqArray();
    this.service.targets = this.buildTargetArray();

    // console.log(this.outlineForm.value);
    // console.log('Saving service:', this.service);

    await this.dataService.savePrivateService(this.userId, this.service);

    this.toastService.showToast('Changes saved.', 2500, 'success', 'bottom', 'center');

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editServiceLanding();
  }

  saveProgress() {
    this.onSubmit(); // attempt to save
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
