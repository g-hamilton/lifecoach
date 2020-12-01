import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { IsoLanguagesService } from 'app/services/iso-languages.service';

@Component({
  selector: 'app-program-landing-page',
  templateUrl: './program-landing-page.component.html',
  styleUrls: ['./program-landing-page.component.scss']
})
export class ProgramLandingPageComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() userId: string;
  @Input() program: CoachingProgram;

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
  public titleMaxLength = 40;
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
    level: {
      required: 'Please select an appropriate level for your program.'
    },
    subject: {
      minlength: `This summary should be at least ${this.subjectMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.subjectMaxLength} characters.`,
      required: 'Please be specific about what your program is about.'
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
    private languagesService: IsoLanguagesService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildLandingForm();
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
      language: ['', [Validators.required]],
      category: [null, [Validators.required]],
      level: [null, [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(this.subjectMinLength), Validators.maxLength(this.subjectMaxLength)]],
      mainImage: [null],
      promoVideo: [null],
      learningPoints: [this.formBuilder.array([])],
      requirements: [this.formBuilder.array([])],
      targets: [this.formBuilder.array([])]
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
      level: this.program.level ? this.program.level : null,
      subject: this.program.subject ? this.program.subject : '',
      image: this.program.image ? this.program.image : null,
      promoVideo: this.program.promoVideo ? this.program.promoVideo : null,
      learningPoints: this.program.learningPoints ? this.loadLpoints() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.learningPointsMaxLength))], Validators.maxLength(this.learningPointsMax)),
      requirements: this.program.requirements ? this.loadRequirements() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.requirementsMaxLength))], Validators.maxLength(this.requirementsMax)),
      targets: this.program.targets ? this.loadTargets() : this.formBuilder.array([new FormControl('', Validators.maxLength(this.targetsMaxLength))], Validators.maxLength(this.targetsMax))
    });
    // init the character counts (before user input detected)
    this.titleActualLength = this.landingF.title.value.length;
    this.subTitleActualLength = this.landingF.subtitle.value.length;
    this.subjectActualLength = this.landingF.subject.value.length;
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

    // Merge landing form data into program data & save the program object
    this.program.title = this.landingF.title.value;
    this.program.subtitle = this.landingF.subtitle.value;

    // console.log(this.outlineForm.value);
    console.log('Saving program:', this.program);

    await this.dataService.savePrivateProgram(this.userId, this.program);

    this.alertService.alert('auto-close', 'Success!', 'Program saved.');

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editProgramLanding();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
