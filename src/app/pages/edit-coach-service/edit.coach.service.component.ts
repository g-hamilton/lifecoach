import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PriceValidator } from 'app/custom-validators/price.validator';

@Component({
  selector: 'app-edit-coach-service',
  templateUrl: 'edit.coach.service.component.html'
})
export class EditCoachServiceComponent implements OnInit {

  public browser: boolean;

  public isNewService: boolean;
  public service: CoachingService;

  public serviceForm: FormGroup;

  public objKeys = Object.keys;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;

  public titleMinLength = 10;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  private baseMinPrice = 1;
  private baseMaxPrice = 10000;
  private baseCurrency = 'GBP';
  private minPrice: number;
  private maxPrice: number;

  public errorMessages = {
    title: {
      minlength: `Your title should be at least ${this.titleMinLength} characters.`,
      maxlength: `Your title should be at less than ${this.titleMaxLength} characters.`
    },
    price: {
      required: `Price is required for paid services.`,
      notNumber: `Price must be a number`,
      belowMin: `Please enter a price above ${this.minPrice}.`,
      aboveMax: `Price enter a price below ${this.maxPrice}`
    }
  };

  public saving: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;

      this.minPrice = this.baseMinPrice;
      this.maxPrice = this.baseMaxPrice;

      this.buildServiceForm();
      this.serviceForm.get('pricingStrategy').valueChanges
      .subscribe(value => {
        this.serviceForm.get('price').updateValueAndValidity();
        this.serviceForm.get('currency').updateValueAndValidity();
      });
      this.updateLocalPriceLimits();

      if (this.router.url.includes('new')) {
        this.isNewService = true;
      } else {
        this.route.params.subscribe(p => {
          if (p.id) {
            console.log(p.id);
          }
        });
      }
    }

  }

  buildServiceForm() {
    this.serviceForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      duration: ['', [Validators.required]],
      serviceType: [null, [Validators.required]],
      pricingStrategy: [null, [Validators.required]],
      price: ['', [this.conditionallyRequiredValidator]],
      currency: ['USD', [this.conditionallyRequiredValidator]],
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

  updateLocalPriceLimits() {
    /*
      Adjusts min & max price validator to set the lowest and highest allowed price
      in multiple currencies, adjusted from the base price & currency.
      As the platform gets charged in GBP, the base is GBP
      https://stripe.com/gb/connect/pricing
      NOT USED YET
    */
  }

  get serviceF(): any {
    return this.serviceForm.controls;
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

  onCurrencyEvent(event: string) {
    console.log('Currency event:', event);
    if (event) {
      this.serviceForm.patchValue({ // update the service form
        currency: event
      });
    }
  }

  onSubmit() {
    //
  }

}
