import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { PriceValidator } from 'app/custom-validators/price.validator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-outline',
  templateUrl: './program-outline.component.html',
  styleUrls: ['./program-outline.component.scss']
})
export class ProgramOutlineComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() program: CoachingProgram;

  public browser: boolean;

  private account: UserAccount;

  public outlineForm: FormGroup;
  public focus: boolean;
  public focus1: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;

  public saving: boolean;
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  private baseMinPrice = 1;
  private baseMaxPrice = 10000;
  private baseCurrency = 'GBP';
  private minPrice = 1;
  private maxPrice = 10000;
  private minPricePerSession = 1;
  private maxPricePerSession = 10000;

  public errorMessages = {
    fullPrice: {
      required: `Please set a price for this program.`,
      notNumber: `Price must be a number`,
      belowMin: `Please enter a price above ${this.minPrice}.`,
      aboveMax: `Price enter a price below ${this.maxPrice}`
    },
    pricePerSession: {
      required: `Please set a price per session or de-select Pay As You Go as an option.`,
      notNumber: `Price must be a number`,
      belowMin: `Please enter a price above ${this.minPricePerSession}.`,
      aboveMax: `Price enter a price below ${this.maxPricePerSession}`
    }
  };

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
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
      this.buildOutlineForm();
      this.subscriptions.add(
        this.outlineForm.get('pricingStrategy').valueChanges
          .subscribe(value => {
            this.outlineForm.get('fullPrice').updateValueAndValidity();
            this.outlineForm.get('pricePerSession').updateValueAndValidity();
            this.outlineForm.get('currency').updateValueAndValidity();
          })
      );
      this.updateLocalPriceLimits();
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
      fullPrice: [0, [Validators.required]],
      pricePerSession: [0, [this.conditionallyRequiredValidator]],
      currency: ['USD', [Validators.required]]
    }, {
      validators: [
        PriceValidator('pricingStrategy', 'fullPrice', this.minPrice, this.maxPrice)
      ]
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
      As the platform gets charged in GBP, the base is GBP
      https://stripe.com/gb/connect/pricing
      NOT USED YET
    */
  }

  importProgramData() {
    let defaultCurrency: string;
    const savedClientCurrencyPref = localStorage.getItem('client-currency');
    savedClientCurrencyPref ? defaultCurrency = savedClientCurrencyPref : defaultCurrency = 'USD';

    this.outlineForm.patchValue({
      programId: this.program.programId,
      pricingStrategy: this.program.pricingStrategy ? this.program.pricingStrategy : 'flexible',
      fullPrice: this.program.fullPrice ? this.program.fullPrice : 0,
      currency: this.program.currency ? this.program.currency : defaultCurrency
    });
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

    // console.log(this.outlineForm.value);
    console.log('Saving program:', this.program);

    await this.dataService.savePrivateProgram(this.userId, this.program);

    this.alertService.alert('auto-close', 'Success!', 'Program saved.');

    this.saving = false;

    this.analyticsService.editProgramOutline();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
