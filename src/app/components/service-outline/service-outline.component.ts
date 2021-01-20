import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-service-outline',
  templateUrl: './service-outline.component.html',
  styleUrls: ['./service-outline.component.scss']
})
export class ServiceOutlineComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() service: CoachingService;

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

  private baseMinPrice = 1;
  private baseMaxPrice = 10000;
  private baseCurrency = 'GBP';
  private minSessions = 2; // should be 2 or above
  private maxSessions = 100;
  private minPrice = 1;
  private maxPrice = 10000;
  public pricingPointsMax = 10;

  public errorMessages = {
    price: {
      required: `Please set a price.`,
      notNumber: `Price must be a number`,
      min: `Please enter a price above ${this.minPrice}.`,
      max: `Price enter a price below ${this.maxPrice}`
    },
    numSessions: {
      required: `Please set a number of sessions.`,
      notNumber: `Must be a number`,
      min: `Please enter a number above ${this.minSessions - 1}.`,
      max: `Price enter a number below ${this.maxSessions}`
    }
  };

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.minPrice = this.baseMinPrice;
      this.maxPrice = this.baseMaxPrice;
      this.buildOutlineForm();
      this.updateLocalPriceLimits();
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
          numSessions: [{
            value: 1,
            disabled: true // disable single session by default (clients must always be allowed to buy 1 session)
          }],
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
      As the platform gets charged in GBP, the base is GBP
      https://stripe.com/gb/connect/pricing
      NOT USED YET
    */
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
          numSessions: [{
            value: 1,
            disabled: true // disable single session by default (clients must always be allowed to buy 1 session)
          }],
          price: [null, [Validators.required, Validators.min(this.minPrice), Validators.max(this.maxPrice)]]
        })
      ], Validators.maxLength(this.pricingPointsMax)),
    );

    // console.log('outlineF.pricing:', this.outlineF.pricing);
  }

  loadPricing() {
    const pricingArray = this.formBuilder.array([], Validators.maxLength(this.pricingPointsMax));
    console.log('service pricing from DB', this.service.pricing);
    Object.keys(this.service.pricing).forEach(key => {
      if (key === '1') {
        pricingArray.push(
          this.formBuilder.group({
            numSessions: [{
              value: 1,
              disabled: true // disable single session by default (clients must always be allowed to buy 1 session)
            }],
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

    this.alertService.alert('auto-close', 'Success!', 'service saved.');

    this.saving = false;
    this.saveAttempt = false;

    this.analyticsService.editServiceOutline();
  }

  calcDiscount() {
    return 0;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
