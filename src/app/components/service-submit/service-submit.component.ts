import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingService } from 'app/interfaces/coaching.service.interface';

@Component({
  selector: 'app-service-submit',
  templateUrl: './service-submit.component.html',
  styleUrls: ['./service-submit.component.scss']
})
export class ServiceSubmitComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() service: CoachingService;

  public serviceForm: FormGroup;
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
      this.buildServiceForm(); // only building for client-side submission ready validation
    }
  }

  ngOnChanges() {
    if (this.service) {
      this.importServiceData();
    }
  }

  buildServiceForm() {
    this.serviceForm = this.formBuilder.group({
      serviceId: ['', [Validators.required]],
      title: ['', [Validators.required]],
      subtitle: ['', [Validators.required]],
      description: ['', [Validators.required]],
      language: [null, [Validators.required]],
      category: [null, [Validators.required]],
      subject: ['', [Validators.required]],
      pricing: [null, [Validators.required]],
      currency: ['USD', [Validators.required]],
      sellerUid: ['', [Validators.required]],
      stripeId: ['', [Validators.required]],
      coachName: ['', [Validators.required]],
      coachPhoto: ['', [Validators.required]],
    });
  }

  importServiceData() {
    this.serviceForm.patchValue({
      serviceId: this.service.serviceId,
      title: this.service.title,
      subtitle: this.service.subtitle,
      description: this.service.description,
      language: this.service.language,
      category: this.service.category,
      subject: this.service.subject,
      pricing: this.service.pricing,
      currency: this.service.currency,
      coachName: this.service.coachName,
      coachPhoto: this.service.coachPhoto,
      stripeId: this.service.stripeId,
      sellerUid: this.service.sellerUid
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

    // return if no service
    if (!this.service) {
      this.alertService.alert('warning-message', 'Service missing. Unable to submit. Please contact support.');
      this.requesting = false;
      return;
    }

    // check if service valid
    if (this.serviceForm.invalid) {
      this.alertService.alert('warning-message', 'Service invalid for review submission. Please contact support.');
      this.requesting = false;
      return;
    }

    // autosave the service now that we've added additional seller profile data
    await this.dataService.savePrivateService(this.service.sellerUid, this.service);

    // request review
    this.dataService.requestServiceReview(this.service);

    // Mark user task complete
    this.dataService.completeUserTask(this.service.sellerUid, 'taskDefault003');

    // Done
    this.alertService.alert('success-message', 'Success!', 'Great job! Your service is now in review. Keep an eye on your inbox for email updates from our Quality Team. Take the rest of the day off, you deserve it ;)');
    this.requesting = false;
    this.analyticsService.submitServiceForReview();
  }

}
