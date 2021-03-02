import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { ToastService } from 'app/services/toast.service';

@Component({
  selector: 'app-service-outline',
  templateUrl: './service-outline.component.html',
  styleUrls: ['./service-outline.component.scss']
})
export class ServiceOutlineComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() service: CoachingService;

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
  private minSessions = 1;
  private maxSessions = 100;
  private minPrice = 29.99;
  private maxPrice = 9999;
  public pricingPointsMax = 3; // keep to max 3 for the purchase UI (3 cards + discovery card)
  public maxDiscountObj = { max: 0 };

  public errorMessages = {
    price: {
      required: `Please set a price`,
      notNumber: `Price must be a number`,
      min: `Price cannot be below ${this.minPrice}`,
      max: `Price cannot be above ${this.maxPrice}`
    },
    numSessions: {
      required: `Please set a number of sessions.`,
      notNumber: `Must be a number`,
      min: `Please enter a number above ${this.minSessions}.`,
      max: `Price enter a number below ${this.maxSessions}`
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
      this.buildOutlineForm();
      this.monitorPlatformRates();
    }
  }

  ngOnChanges() {
    if (this.service) {
      this.importserviceData();
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
      serviceId: ['', [Validators.required]],
      pricing: this.formBuilder.array([
        // sessions/price group
        this.formBuilder.group({
          numSessions: [1, [Validators.required, Validators.min(1)]],
          price: [null, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
        })
      ]),
      currency: ['USD', [Validators.required]]
    });

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
    this.outlineForm.get('pricing.0.price').clearValidators();
    this.outlineForm.get('pricing.0.price').setValidators([Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]);
    this.outlineForm.get('pricing.0.price').updateValueAndValidity();

    // reset the error message object with new values
    this.errorMessages.price.min = `Price cannot be below ${this.minPrice}`;
    this.errorMessages.price.max = `Price cannot be above ${this.maxPrice}`;
  }

  importserviceData() {
    let defaultCurrency: string;
    const savedClientCurrencyPref = localStorage.getItem('client-currency');
    savedClientCurrencyPref ? defaultCurrency = savedClientCurrencyPref : defaultCurrency = 'USD';

    this.outlineForm.patchValue({
      serviceId: this.service.serviceId,
      currency: this.service.currency ? this.service.currency : defaultCurrency
    });

    this.outlineForm.setControl('pricing', this.service.pricing ? this.loadPricing() : this.formBuilder.array([
        // sessions/price group
        this.formBuilder.group({
          numSessions: [1, [Validators.required, Validators.min(1)]],
          price: [null, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
        })
      ], Validators.maxLength(this.pricingPointsMax)),
    );

    // now we've imported the data, update local price limits again
    this.updateLocalPriceLimits();

    // console.log('outlineF.pricing:', this.outlineF.pricing);
  }

  loadPricing() {
    const pricingArray = this.formBuilder.array([], Validators.maxLength(this.pricingPointsMax));
    // console.log('service pricing from DB', this.service.pricing);
    Object.keys(this.service.pricing).forEach(key => {
      if (key === '1') {
        pricingArray.push(
          this.formBuilder.group({
            numSessions: [1, [Validators.required, Validators.min(1)]],
            price: [this.service.pricing[key].price, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
          })
        );
      } else {
        pricingArray.push(
          // load sessions/price group
          this.formBuilder.group({
            numSessions: [this.service.pricing[key].numSessions, [Validators.required, Validators.min(this.minSessions), Validators.max(this.maxSessions)]],
            price: [this.service.pricing[key].price, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
          }));
      }
    });
    return pricingArray;
  }

  addPricingPoint() {
    // add sessions/price group
    const control = this.formBuilder.group({
      numSessions: [null, [Validators.required, Validators.min(this.minSessions), Validators.max(this.maxSessions)]],
      price: [null, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
    });
    this.outlineF.pricing.controls.push(control);
  }

  deletePricingPoint(index: number) {
    this.outlineF.pricing.controls.splice(index, 1);
    this.maxDiscountObj.max = 0;
  }

  buildPricing() {
    /*
    returns a pricing object.
    each key in the objet should be a unique number of sessions with a value that contains the number of sessions and a price
    eg. {1: {numSessions: 1, price: 30}}
    a client can purchase 1 session for 30 units of currency
    */
    const obj = {};
    (this.outlineF.pricing as FormArray).controls.forEach(control => {
      if (control.errors) {
        return;
      }
      if (!control.value.numSessions) {
        obj[1] = { numSessions: 1, price: control.value.price};
        return;
      }
      obj[control.value.numSessions] = control.value;
    });
    if (Object.keys(obj).length === 0) {
      return null;
    }
    return obj;
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
      // should already be done before creating a service but doesn't hurt to check again or we can't pay the coach!
      this.alertService.alert('warning-message', 'Oops', 'Before creating a coaching service you must enable your payout account so you can get paid. Visit Account > Payout Settings to enable payouts now.');
      this.saving = false;
      return;
    }

    // Merge outline form data into service data & save the service object
    this.service.pricing = this.buildPricing();
    this.service.currency = this.outlineF.currency.value;
    this.service.stripeId = this.account.stripeUid; // Important! Without this the creator cannot be paid!

    // console.log(this.outlineForm.value);
    console.log('Saving service:', this.service);

    await this.dataService.savePrivateService(this.userId, this.service);

    this.toastService.showToast('Changes saved.', 2500, 'success', 'bottom', 'center');

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editServiceOutline();
  }

  calcDiscount(key: number) {
    // console.log(key);

    const controls = this.outlineF.pricing.controls;
    // console.log(controls);

    // check that prices exist
    if (!controls) {
      return 0;
    }

    // find the lowest number of sessions in the pricing
    const sessions = [];
    controls.forEach(i => sessions.push(i.controls.numSessions.value));
    sessions.sort();
    // console.log(sessions);
    const lowest = sessions[0];
    // console.log(lowest);
    if (key === lowest) { // this is the lowest number of sessions so there can't be a discount here
    return 0;
    }

    // calculate the base price per session
    const index = controls.findIndex(i => i.controls.numSessions.value === lowest);
    // console.log(index);
    const basePricePerSession = Number((controls[index].controls.price.value / controls[index].controls.numSessions.value));
    // console.log(basePricePerSession);
    if (!basePricePerSession || basePricePerSession === Infinity || isNaN(basePricePerSession)) {
      return 0;
    }

    // calculate this package price per session
    const index1 = controls.findIndex(i => i.controls.numSessions.value === key);
    // console.log('index1', index1);
    const thisPricePerSession = Number((controls[index1].controls.price.value / controls[index1].controls.numSessions.value));
    // console.log(thisPricePerSession);
    if (!thisPricePerSession || thisPricePerSession === Infinity || isNaN(thisPricePerSession)) {
      return 0;
    }

    // it's discount time!
    const discount = Number((100 - ((thisPricePerSession  / basePricePerSession) * 100)).toFixed());

    // update the max discount if required
    this.maxDiscountObj.max = 0;
    if (discount > this.maxDiscountObj.max) {
      this.maxDiscountObj.max = discount;
    }

    // return the discount
    return discount;
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
