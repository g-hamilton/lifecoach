import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { ToastService } from 'app/services/toast.service';

@Component({
  selector: 'app-program-outline',
  templateUrl: './program-outline.component.html',
  styleUrls: ['./program-outline.component.scss']
})
export class ProgramOutlineComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() program: CoachingProgram;

  @Output() goNextEvent = new EventEmitter<any>();

  public browser: boolean;

  private account: UserAccount;

  public outlineForm: FormGroup;
  public focus: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;
  public focus3Touched: boolean;

  public saving: boolean;
  public saveAttempt: boolean;
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  private baseMinPrice = 29.99; // minimum allowed price in base currency
  private baseMaxPrice = 9999; // maximum allowed price in base currency
  private baseCurrency = 'GBP';
  private rates: any;
  private minPrice = 29.99;
  private maxPrice = 9999;

  public errorMessages = {
    fullPrice: {
      required: `Please set a price for this program`,
      notNumber: `Price must be a number`,
      min: `Price cannot be below ${this.minPrice}`,
      max: `Price cannot be above ${this.maxPrice}`
    },
    pricePerSession: {
      required: `Please set a price per session or de-select Pay As You Go as an option`,
      notNumber: `Price must be a number`,
      min: `Price cannot be below ${this.minPrice}`,
      max: `Price cannot be above ${this.maxPrice}`
    },
    numSessions: {
      required: `Please enter a number`
    },
    duration: {
      required: `Please enter a number (in weeks)`
    }
  };

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.minPrice = this.baseMinPrice;
      this.maxPrice = this.baseMaxPrice;
      this.buildOutlineForm();
      this.subscriptions.add(
        this.outlineForm.get('pricingStrategy').valueChanges
          .subscribe(value => {
            this.outlineForm.get('fullPrice').updateValueAndValidity();
            this.outlineForm.get('pricePerSession').updateValueAndValidity();
            this.outlineForm.get('currency').updateValueAndValidity();
          })
      );
      this.monitorPlatformRates();
    }
  }

  ngOnChanges() {
    if (this.program) {
      this.importProgramData();
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

  buildOutlineForm() {
    this.outlineForm = this.formBuilder.group({
      programId: ['', [Validators.required]],
      pricingStrategy: ['flexible', [Validators.required]],
      fullPrice: [null, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]],
      pricePerSession: [null, [this.conditionallyRequiredValidator, Validators.min(this.minPrice), Validators.max(this.maxPrice)]],
      currency: ['USD', [Validators.required]],
      numSessions: [null, [Validators.required]],
      duration: [null, [Validators.required]],
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
    const selectedCurrency = this.outlineF.currency.value;
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
    this.outlineForm.get('fullPrice').clearValidators();
    this.outlineForm.get('fullPrice').setValidators([Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]);
    this.outlineForm.get('fullPrice').updateValueAndValidity();
    this.outlineForm.get('pricePerSession').clearValidators();
    this.outlineForm.get('pricePerSession').setValidators([this.conditionallyRequiredValidator, Validators.min(this.minPrice), Validators.max(this.maxPrice)]);
    this.outlineForm.get('pricePerSession').updateValueAndValidity();

    // reset the error message object with new values
    this.errorMessages.fullPrice.min = `Price cannot be below ${this.minPrice}`;
    this.errorMessages.fullPrice.max = `Price cannot be above ${this.maxPrice}`;
    this.errorMessages.pricePerSession.min = `Price cannot be below ${this.minPrice}`;
    this.errorMessages.pricePerSession.max = `Price cannot be above ${this.maxPrice}`;
  }

  importProgramData() {
    let defaultCurrency: string;
    const savedClientCurrencyPref = localStorage.getItem('client-currency');
    savedClientCurrencyPref ? defaultCurrency = savedClientCurrencyPref : defaultCurrency = 'USD';

    this.outlineForm.patchValue({
      programId: this.program.programId,
      pricingStrategy: this.program.pricingStrategy ? this.program.pricingStrategy : 'flexible',
      fullPrice: this.program.fullPrice ? this.program.fullPrice : null,
      pricePerSession: this.program.pricePerSession ? this.program.pricePerSession : null,
      currency: this.program.currency ? this.program.currency : defaultCurrency,
      numSessions: this.program.numSessions ? this.program.numSessions : null,
      duration: this.program.duration ? this.program.duration : null,
    });

    // now we've imported the data, update local price limits again
    this.updateLocalPriceLimits();
  }

  get outlineF(): any {
    return this.outlineForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onCurrencyEvent(event: string) {
    // console.log('Currency event:', event);
    if (event) {
      this.outlineForm.patchValue({ // update the form
        currency: event
      });
      this.updateLocalPriceLimits(); // update the local price limits again using the new currency selected
    }
  }

  async onSubmit() {
    this.saveAttempt = true;
    this.saving = true;

    // safety checks

    if (this.outlineForm.invalid) {
      console.log(this.outlineForm.value);
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save data.');
      this.saving = false;
      return;
    }

    if (!this.account.stripeUid) {
      // should already be done before creating a program but doesn't hurt to check again or we can't pay the coach!
      this.alertService.alert('warning-message', 'Oops', 'Before creating a coaching program you must enable your payout account so you can get paid. Visit Account > Payout Settings to enable payouts now.');
      this.saving = false;
      return;
    }

    // Merge outline form data into program data & save the program object
    this.program.pricingStrategy = this.outlineF.pricingStrategy.value;
    this.program.fullPrice = this.outlineF.fullPrice.value;
    if (this.program.pricingStrategy === 'flexible') {
      this.program.pricePerSession = this.outlineF.pricePerSession.value;
    }
    this.program.currency = this.outlineF.currency.value;
    this.program.stripeId = this.account.stripeUid; // Important! Without this the creator cannot be paid!
    this.program.numSessions = this.outlineF.numSessions.value;
    this.program.duration = this.outlineF.duration.value;

    // console.log(this.outlineForm.value);
    console.log('Saving program:', this.program);

    await this.dataService.savePrivateProgram(this.userId, this.program);

    this.toastService.showToast('Changes saved.', 2500, 'success', 'bottom', 'center');

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editProgramOutline();
  }

  calcDiscount() {
    if (!this.outlineF.fullPrice.value) {
      return 0;
    }
    if (!this.outlineF.numSessions.value) {
      return 0;
    }
    if (!this.outlineF.pricePerSession.value) {
      return 0;
    }
    if ((this.outlineF.numSessions.value * this.outlineF.pricePerSession.value) <= this.outlineF.fullPrice.value) {
      return 0;
    }
    return (100 - (this.outlineF.fullPrice.value / (this.outlineF.numSessions.value * this.outlineF.pricePerSession.value)) * 100).toFixed();
  }

  saveProgress() {
    this.onSubmit(); // attempt to save
  }

  async goNext() {
    await this.onSubmit(); // attempt to autosave
    if (this.outlineForm.invalid) {
      return;
    }
    // safe to proceed to next tab so emit the event to the parent component
    this.goNextEvent.emit(2); // emit zero indexed tab id number
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
