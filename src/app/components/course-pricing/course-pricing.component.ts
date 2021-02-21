import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { CoachingCourse } from 'app/interfaces/course.interface';

import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-pricing',
  templateUrl: './course-pricing.component.html',
  styleUrls: ['./course-pricing.component.scss']
})
export class CoursePricingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  @Output() goNextEvent = new EventEmitter<any>();

  public browser: boolean;

  private account: UserAccount;

  public pricingForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  private baseMinPrice = 9.99; // minimum allowed price in base currency
  private baseMaxPrice = 9999; // maximum allowed price in base currency
  private baseCurrency = 'GBP';
  private rates: any;
  private minPrice = 9.99;
  private maxPrice = 9999;

  public errorMessages = {
    price: {
      required: `Price is required for paid courses`,
      notNumber: `Price must be a number`,
      min: `Please cannot be below ${this.minPrice}`,
      max: `Price cannot be above ${this.maxPrice}`
    }
  };

  public saving: boolean;
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.minPrice = this.baseMinPrice;
      this.maxPrice = this.baseMaxPrice;
      this.buildPricingForm();
      this.subscriptions.add(
        this.pricingForm.get('pricingStrategy').valueChanges
          .subscribe(value => {
            this.pricingForm.get('price').updateValueAndValidity();
            this.pricingForm.get('currency').updateValueAndValidity();
          })
      );
      this.monitorPlatformRates();
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

  monitorPlatformRates() {
    // Monitor platform rates for realtime price calculations
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          // console.log('Rates:', rates);
          this.rates = rates;

          // update local price limits any time the rates change
          this.updateLocalPriceLimits();
        }
      })
    );
  }

  loadUserData() {
    this.subscriptions.add(
      this.dataService.getUserAccount(this.userId).subscribe(account => {
        if (account) {
          this.account = account;
        }
      })
    );
  }

  updateLocalPriceLimits() {
    /*
      Adjusts min & max price validator to set the lowest and highest allowed price
      in multiple currencies, adjusted from the base price & currency.
      As the platform gets charged in GBP, the base is GBP.
      Note: platform rates are in USD.
      https://stripe.com/gb/connect/pricing
    */

    // safety catch if rates not loaded yet, do nothing as we'll be called again
    if (!this.rates) {
      return;
    }

    // calculate current conversion rate to go from platform base currency into USD (the rate benchmark currency & form default currency)
    const baseUsd = 1 / this.rates[this.baseCurrency];
    // console.log('base conversion rate to USD:', baseUsd);

    // calculate the minimum price in USD at the current platform currency conversion rate
    const minPriceUsd = this.baseMinPrice * baseUsd;
    const maxPriceUsd = this.baseMaxPrice * baseUsd;
    // console.log('minimum price in USD:', minPriceUsd);
    // console.log('maximum price in USD:', maxPriceUsd);

    // check the current value of the selected currency in the form
    const selectedCurrency = this.pricingF.currency.value;
    // console.log('selected currency is:', selectedCurrency);

    // update the limits based on the selected currency in the form
    const minimumPrice = Number((minPriceUsd * this.rates[selectedCurrency] as number));
    const maximumPrice = Number((maxPriceUsd * this.rates[selectedCurrency] as number));
    // console.log(`updated minimum price in ${selectedCurrency}: ${minimumPrice}`);
    // console.log(`updated maximum price in ${selectedCurrency}: ${maximumPrice}`);

    // round prices
    if (!Number.isInteger(minimumPrice)) { // min price is not an integer
      const roundedMin = Math.floor(minimumPrice) + .99; // round up to .99
      this.minPrice = roundedMin;
    } else { // min price is an integer
      this.minPrice = minimumPrice + 1; // add 1 as a margin
    }
    // console.log('rounded minimum price:', this.minPrice);
    if (!Number.isInteger(maximumPrice)) { // max price is not an integer
      const roundedMax = Math.floor(maximumPrice) + .99; // round up to .99
      this.maxPrice = roundedMax;
    } else { // max price is an integer
      this.maxPrice = maximumPrice + 1; // add 1 as a margin
    }
    // console.log('rounded maximum price:', this.maxPrice);

    // update the form validators
    this.pricingForm.get('price').clearValidators();
    this.pricingForm.get('price').setValidators([this.conditionallyRequiredValidator, Validators.min(this.minPrice), Validators.max(this.maxPrice)]);
    this.pricingForm.get('price').updateValueAndValidity();

    // reset the error message object with new values
    this.errorMessages.price.min = `Price cannot be below ${this.minPrice}`;
    this.errorMessages.price.max = `Price cannot be above ${this.maxPrice}`;
  }

  buildPricingForm() {
    this.pricingForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      pricingStrategy: [null, [Validators.required]],
      price: ['', [this.conditionallyRequiredValidator, Validators.min(this.minPrice), Validators.max(this.maxPrice)]],
      currency: ['USD', [this.conditionallyRequiredValidator]],
      disableInstructorSupport: [false],
      disableAllDiscussion: [false]
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
      currency: this.course.currency ? this.course.currency : defaultCurrency,
      disableInstructorSupport: this.course.disableInstructorSupport ? this.course.disableInstructorSupport : false,
      disableAllDiscussion: this.course.disableAllDiscussion ? this.course.disableAllDiscussion : false
    });

    // now we've imported the data, update local price limits again
    this.updateLocalPriceLimits();
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
      this.updateLocalPriceLimits(); // update the local price limits again using the new currency selected
    }
  }

  async onStrategyChange(ev: any) {
    console.log(ev.target.value);
    // if account stripe id continue otherwise divert to setup stripe first
    if (ev.target.value === 'paid' && this.account && this.account.stripeUid) {
      // do nothing as form will be updated to paid now
    } else {
      // reset form back to free as paid strategy is not allowed with a stripe account
      this.pricingForm.patchValue({pricingStrategy: 'free'});
      // alert
      const res = await this.alertService.alert('title-and-text', 'Just a second!', `Before you can create a paid course, you need to enable payments
      so you can get paid.`, `Enable Now`) as any;
      if (res.value) {
        this.router.navigate(['/account', 'payout-settings']); // navigate to setup stripe
      }
    }
  }

  onDisableInstructorSupportToggle(ev: any) {
    this.pricingForm.patchValue({disableInstructorSupport: ev.currentValue});
  }

  onDisableAllDiscussionToggle(ev: any) {
    this.pricingForm.patchValue({disableAllDiscussion: ev.currentValue});
  }

  async onSubmit() {
    this.saveAttempt = true;
    this.saving = true;

    // safety checks

    if (this.pricingForm.invalid) {
      // console.log(this.pricingForm.value);
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save data.');
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
    // console.log('Saving course:', this.course);

    await this.dataService.savePrivateCourse(this.userId, this.course);

    this.alertService.alert('auto-close', 'Success!', 'Changes saved.');
    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editCourseOptions();
  }

  saveProgress() {
    this.onSubmit(); // attempt to save
  }

  async goNext() {
    await this.onSubmit(); // attempt to autosave
    if (this.pricingForm.invalid) {
      return;
    }
    // safe to proceed to next tab so emit the event to the parent component
    this.goNextEvent.emit(3); // emit zero indexed tab id number
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
