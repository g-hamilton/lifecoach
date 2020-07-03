import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { CoachingCourse } from 'app/interfaces/course.interface';

import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { PriceValidator } from 'app/custom-validators/price.validator';
import { AuthService } from 'app/services/auth.service';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-pricing',
  templateUrl: './course-pricing.component.html',
  styleUrls: ['./course-pricing.component.scss']
})
export class CoursePricingComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  public browser: boolean;

  private account: UserAccount;

  public pricingForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  private baseMinPrice = 1;
  private baseMaxPrice = 10000;
  private baseCurrency = 'GBP';
  private minPrice: number;
  private maxPrice: number;

  public errorMessages = {
    price: {
      required: `Price is required for paid courses.`,
      notNumber: `Price must be a number`,
      belowMin: `Please enter a price above ${this.minPrice}.`,
      aboveMax: `Price enter a price below ${this.maxPrice}`
    }
  };

  public saving: boolean;

  public objKeys = Object.keys;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.minPrice = this.baseMinPrice;
      this.maxPrice = this.baseMaxPrice;
      this.buildPricingForm();
      this.pricingForm.get('pricingStrategy').valueChanges
      .subscribe(value => {
        this.pricingForm.get('price').updateValueAndValidity();
        this.pricingForm.get('currency').updateValueAndValidity();
      });
      this.updateLocalPriceLimits();
    }
  }

  ngOnChanges() {
    if (this.course) {
      this.importCourseData();
    }
    if (this.userId) {
      if (!this.account) {
        this.loadUserData();
      }
    }
  }

  loadUserData() {
    this.dataService.getUserAccount(this.userId).subscribe(account => {
      if (account) {
        this.account = account;
      }
    });
  }

  updateLocalPriceLimits() {
    /*
      Adjusts min & max price validator to set the lowest and highest allowed price
      in multiple currencies, adjusted from the base price & currency.
      As the platform gets charged in GBP, the base is GBP
      https://stripe.com/gb/connect/pricing
      NOT USED YET
    */
  }

  buildPricingForm() {
    this.pricingForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      pricingStrategy: [null, [Validators.required]],
      price: ['', [this.conditionallyRequiredValidator]],
      currency: ['USD', [this.conditionallyRequiredValidator]],
      disableInstructorSupport: [false],
      disableAllDiscussion: [false],
      includeInCoachingForCoaches: [false]
    }, {
      validators: [
        PriceValidator('pricingStrategy', 'price', this.minPrice, this.maxPrice)
      ]
    });
  }

  // https://medium.com/ngx/3-ways-to-implement-conditional-validation-of-reactive-forms-c59ed6fc3325
  conditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('pricingStrategy').value === 'paid') {
      return Validators.required(formControl);
    }
    return null;
  }

  importCourseData() {
    let defaultCurrency: string;
    const savedClientCurrencyPref = localStorage.getItem('client-currency');
    savedClientCurrencyPref ? defaultCurrency = savedClientCurrencyPref : defaultCurrency = 'USD';

    this.pricingForm.patchValue({
      courseId: this.course.courseId,
      pricingStrategy: this.course.pricingStrategy ? this.course.pricingStrategy : 'free',
      price: this.course.price ? this.course.price : '',
      currency: this.course.currency ? this.course.currency : defaultCurrency
    });
  }

  get pricingF(): any {
    return this.pricingForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onCurrencyEvent(event: string) {
    console.log('Currency event:', event);
    if (event) {
      this.pricingForm.patchValue({ // update the pricing form
        currency: event
      });
    }
  }

  async onStrategyChange(ev: any) {
    console.log(ev.target.value);
    // if account stripe id continue otherwise divert to setup stripe first
    if (ev.target.value === 'paid' && this.account && this.account.stripeUid) {
      // do nothing as form will be updated to paid now
    } else {
      // reset form back to free as paid strategy is not allowed with a stripe account
      this.pricingForm.patchValue({ pricingStrategy: 'free'});
      // alert
      const res = await this.alertService.alert('title-and-text', 'Just a second!', `Before you can create a paid course, you need to enable payments
      so you can get paid.`, `Enable Now`) as any;
      if (res.value) {
        this.router.navigate(['/account', 'payout-settings']); // navigate to setup stripe
      }
    }
  }

  onDisableInstructorSupportToggle(ev: any) {
    this.pricingForm.patchValue({ disableInstructorSupport: ev.currentValue });
  }

  onDisableAllDiscussionToggle(ev: any) {
    this.pricingForm.patchValue({ disableAllDiscussion: ev.currentValue });
  }

  onIncludeInCoachingForCoachesToggle(ev: any) {
    this.pricingForm.patchValue({ includeInCoachingForCoaches: ev.currentValue });
  }

  async onSubmit() {
    this.saving = true;

    // safety checks

    if (this.pricingForm.invalid) {
      console.log(this.pricingForm.value);
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save landing page data.');
      this.saving = false;
      return;
    }

    if (this.pricingF.pricingStrategy.value === 'paid' && !this.account.stripeUid) {
      this.pricingForm.patchValue({ pricingStrategy: 'free'}); // should already be done by component but double safe!
      this.alertService.alert('warning-message', 'Oops', 'Before creating a paid course you must enable your payout account. Visit Account > Payout Settings to enable payouts now.');
      this.saving = false;
      return;
    }

    // Merge pricing form data into course data & save the course object
    this.course.pricingStrategy = this.pricingF.pricingStrategy.value;
    if (this.course.pricingStrategy === 'paid' && this.account.stripeUid) {
      this.course.price = this.pricingF.price.value;
      this.course.currency = this.pricingF.currency.value;
      this.course.stripeId = this.account.stripeUid; // Important! Without this the creator cannot be paid!
    }
    this.course.disableInstructorSupport = this.pricingF.disableInstructorSupport.value;
    this.course.disableAllDiscussion = this.pricingF.disableAllDiscussion.value;
    this.course.includeInCoachingForCoaches = this.pricingF.includeInCoachingForCoaches.value;

    // console.log(this.pricingForm.value);
    console.log('Saving course:', this.course);

    await this.dataService.savePrivateCourse(this.userId, this.course);

    this.alertService.alert('auto-close', 'Success!', 'Course saved.');

    this.saving = false;

    this.analyticsService.editCourseOptions();
  }

}
