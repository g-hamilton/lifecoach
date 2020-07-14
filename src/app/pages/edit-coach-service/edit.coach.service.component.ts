import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PriceValidator } from 'app/custom-validators/price.validator';
import { AlertService } from 'app/services/alert.service';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { DataService } from 'app/services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-edit-coach-service',
  templateUrl: 'edit.coach.service.component.html'
})
export class EditCoachServiceComponent implements OnInit, AfterViewInit {

  public browser: boolean;

  private userId: string;

  public isNewService: boolean;
  public service: CoachingService;

  public serviceForm: FormGroup;

  public objKeys = Object.keys;

  public viewLoaded: boolean;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focus3: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;
  public focus3Touched: boolean;

  public titleMinLength = 8;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  public subTitleMinLength = 10;
  public subTitleMaxLength = 120;
  public subTitleActualLength = 0;

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
    subtitle: {
      minlength: `Your sub-title should be at least ${this.subTitleMinLength} characters.`,
      maxlength: `Your sub-title should be at less than ${this.subTitleMaxLength} characters.`,
      required: 'Please enter a sub-title.'
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
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private storageService: StorageService,
    private dataService: DataService,
    private analyticsService: AnalyticsService
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

      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  buildServiceForm() {
    this.serviceForm = this.formBuilder.group({
      id: [null],
      coachUid: [null],
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      subtitle: ['', [Validators.required, Validators.minLength(this.subTitleMinLength), Validators.maxLength(this.subTitleMaxLength)]],
      duration: ['', [Validators.required]],
      serviceType: [null, [Validators.required]],
      pricingStrategy: [null, [Validators.required]],
      price: ['', [this.conditionallyRequiredValidator]],
      currency: ['USD', [this.conditionallyRequiredValidator]],
      image: [null],
      description: ['', [Validators.required]]
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

  onSubTitleInput(ev: any) {
    this.subTitleActualLength = (ev.target.value as string).length;
  }

  onCurrencyEvent(event: string) {
    console.log('Currency event:', event);
    if (event) {
      this.serviceForm.patchValue({ // update the service form
        currency: event
      });
    }
  }

  onPictureUpload(event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen file when
      an image is chosen. We'll listen for that change here and grab the
      selected file for saving to storage & patching into our form control.
    */
    console.log(`Updating service image with: ${event}`);
    this.serviceForm.patchValue({
      image: event
    });
  }

  async onSubmit() {
    console.log('Form is valid?:', this.serviceForm.valid);
    console.log('Form data:', this.serviceForm.value);

    this.saving = true;

    // safety checks
    if (!this.serviceF.title.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a title.');
      this.saving = false;
      return;
    }
    if (!this.serviceF.subtitle.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a subtitle.');
      this.saving = false;
      return;
    }
    if (!this.serviceF.duration.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add a duration.');
      this.saving = false;
      return;
    }
    if (!this.serviceF.serviceType.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please select a type.');
      this.saving = false;
      return;
    }
    if (!this.serviceF.pricingStrategy.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please select whether this service is free or paid.');
      this.saving = false;
      return;
    }
    if (this.serviceF.pricingStrategy.value === 'paid') {
      if (!this.serviceF.price.value) {
        this.alertService.alert('warning-message', 'Oops', 'Please add a price.');
        this.saving = false;
        return;
      }
      if (!this.serviceF.currency.value) {
        this.alertService.alert('warning-message', 'Oops', 'Please select a currency.');
        this.saving = false;
        return;
      }
    }
    if (!this.serviceF.image.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please add an image.');
      this.saving = false;
      return;
    }
    if (!this.serviceF.description.value) {
      this.alertService.alert('warning-message', 'Oops', 'Please enter a description.');
      this.saving = false;
      return;
    }

    // catch all fallback
    if (this.serviceForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot save data');
      this.saving = false;
      return;
    }

    // safety checks all passed

    // Handle image upload to storage if required.
    if (this.serviceF.image.value && !this.serviceF.image.value.includes(this.storageService.getStorageDomain())) {
      console.log(`Uploading unstored image to storage...`);
      const url = await this.storageService.storeServiceImageUpdateDownloadUrl(this.userId, this.serviceF.image.value);
      console.log(`Image stored successfully. Patching form data download URL: ${url}`);
      this.serviceForm.patchValue({
        image: url
      });
    }

    // prepare the service object from form data
    const service = this.serviceForm.value as CoachingService;

    // if this is a new service
    if (this.isNewService) {
      if (!service.id) {
        service.id = Math.random().toString(36).substr(2, 9); // generate semi-random id
      }
      if (!service.coachUid) {
        service.coachUid = this.userId;
      }
      this.analyticsService.addNewCoachingService(service.id);
    }

    // save to DB
    await this.dataService.saveCoachService(this.userId, service);

    this.alertService.alert('auto-close', 'Success!', 'Service saved.');

    this.analyticsService.updateCoachingService(service.id);

    this.saving = false;

    this.router.navigate(['services']);
  }

}
