import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-submit',
  templateUrl: './program-submit.component.html',
  styleUrls: ['./program-submit.component.scss']
})
export class ProgramSubmitComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() program: CoachingProgram;

  public programForm: FormGroup;
  public browser: boolean;
  public requesting: boolean;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    public formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildProgramForm(); // only building for client-side submission ready validation
    }
  }

  ngOnChanges() {
    if (this.program) {
      this.importProgramData();
    }
  }

  buildProgramForm() {
    this.programForm = this.formBuilder.group({
      programId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      subtitle: ['', [Validators.required]],
      description: ['', [Validators.required]],
      language: [null, [Validators.required]],
      category: [null, [Validators.required]],
      subject: ['', [Validators.required]],
      imageOption: [null, [Validators.required]],
      image: [null],
      imagePaths: [null],
      pricingStrategy: ['flexible', [Validators.required]],
      fullPrice: [null, [Validators.required]],
      pricePerSession: [null, [this.conditionallyRequiredValidator]],
      currency: ['USD', [Validators.required]],
      numSessions: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      sellerUid: ['', [Validators.required]],
      stripeId: ['', [Validators.required]],
      coachName: ['', [Validators.required]],
      coachPhoto: ['', [Validators.required]],
    });
  }

  // https://medium.com/ngx/3-ways-to-implement-conditional-validation-of-reactive-forms-c59ed6fc3325
  conditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('pricingStrategy').value === 'flexible') {
      return Validators.required(formControl);
    }
    return null;
  }

  importProgramData() {
    this.programForm.patchValue({
      programId: this.program.programId,
      title: this.program.title,
      subtitle: this.program.subtitle,
      description: this.program.description,
      language: this.program.language,
      category: this.program.category,
      subject: this.program.subject,
      image: this.program.image,
      imagePaths: this.program.imagePaths,
      imageOption: this.program.imageOption,
      pricingStrategy: this.program.pricingStrategy,
      fullPrice: this.program.fullPrice,
      pricePerSession: this.program.pricePerSession,
      currency: this.program.currency,
      numSessions: this.program.numSessions,
      duration: this.program.duration,
      coachName: this.program.coachName,
      coachPhoto: this.program.coachPhoto,
      stripeId: this.program.stripeId,
      sellerUid: this.program.sellerUid
    });
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  async onSubmit() {
    this.requesting = true;

    // return if no program
    if (!this.program) {
      this.alertService.alert('warning-message', 'Program missing. Unable to submit. Please contact support.');
      this.requesting = false;
      return;
    }

    // check if program valid
    if (this.programForm.invalid) {
      this.alertService.alert('warning-message', 'Program invalid for review submission. Please contact support.');
      this.requesting = false;
      return;
    }

    // autosave the program now that we've added additional seller profile data
    await this.dataService.savePrivateProgram(this.program.sellerUid, this.program);

    // request review
    this.dataService.requestProgramReview(this.program);

    // Mark user task complete
    this.dataService.completeUserTask(this.program.sellerUid, 'taskDefault003');

    // Done
    this.alertService.alert('success-message', 'Success!', 'Great job! Your program is now in review. Keep an eye on your inbox for email updates from our Quality Team. Take the rest of the day off, you deserve it ;)');
    this.requesting = false;
    this.analyticsService.submitProgramForReview();
  }

}
