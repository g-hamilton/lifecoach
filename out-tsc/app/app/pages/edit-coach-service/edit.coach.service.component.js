var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { PriceValidator } from 'app/custom-validators/price.validator';
import { AlertService } from 'app/services/alert.service';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { DataService } from 'app/services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
let EditCoachServiceComponent = class EditCoachServiceComponent {
    constructor(platformId, route, router, formBuilder, authService, alertService, storageService, dataService, analyticsService) {
        this.platformId = platformId;
        this.route = route;
        this.router = router;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.alertService = alertService;
        this.storageService = storageService;
        this.dataService = dataService;
        this.analyticsService = analyticsService;
        this.objKeys = Object.keys;
        this.titleMinLength = 8;
        this.titleMaxLength = 60;
        this.titleActualLength = 0;
        this.subTitleMinLength = 10;
        this.subTitleMaxLength = 120;
        this.subTitleActualLength = 0;
        this.baseMinPrice = 1;
        this.baseMaxPrice = 10000;
        this.baseCurrency = 'GBP';
        this.errorMessages = {
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
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.minPrice = this.baseMinPrice;
            this.maxPrice = this.baseMaxPrice;
            this.buildServiceForm();
            this.subscriptions.add(this.serviceForm.get('pricingStrategy').valueChanges
                .subscribe(value => {
                this.serviceForm.get('price').updateValueAndValidity();
                this.serviceForm.get('currency').updateValueAndValidity();
            }));
            this.updateLocalPriceLimits();
            this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
                if (user) {
                    this.userId = user.uid;
                    this.checkRouteData();
                }
            }));
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
    conditionallyRequiredValidator(formControl) {
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
    checkRouteData() {
        if (this.router.url.includes('new')) {
            this.isNewService = true;
        }
        else {
            this.route.params.subscribe(p => {
                if (p.id) {
                    this.importCoachingServiceData(p.id);
                }
            });
        }
    }
    importCoachingServiceData(serviceId) {
        this.loading = true;
        this.subscriptions.add(this.dataService.getCoachServiceById(this.userId, serviceId).subscribe(service => {
            if (service) {
                console.log('importing service:', service);
                // patch service data into form data
                this.serviceForm.patchValue({
                    id: service.id,
                    coachUid: service.coachUid,
                    title: service.title,
                    subtitle: service.subtitle,
                    duration: service.duration,
                    serviceType: service.serviceType,
                    pricingStrategy: service.pricingStrategy,
                    price: service.price,
                    currency: service.currency,
                    image: service.image,
                    description: service.description
                });
            }
            this.loading = false;
        }));
    }
    get serviceF() {
        return this.serviceForm.controls;
    }
    showError(control, error) {
        if (this.errorMessages[control][error]) {
            return this.errorMessages[control][error];
        }
        return 'Invalid input';
    }
    onTitleInput(ev) {
        this.titleActualLength = ev.target.value.length;
    }
    onSubTitleInput(ev) {
        this.subTitleActualLength = ev.target.value.length;
    }
    onCurrencyEvent(event) {
        console.log('Currency event:', event);
        if (event) {
            this.serviceForm.patchValue({
                currency: event
            });
        }
    }
    onPictureUpload(event) {
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
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const url = yield this.storageService.storeServiceImageUpdateDownloadUrl(this.userId, this.serviceF.image.value);
                console.log(`Image stored successfully. Patching form data download URL: ${url}`);
                this.serviceForm.patchValue({
                    image: url
                });
            }
            // prepare the service object from form data
            const service = this.serviceForm.value;
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
            yield this.dataService.saveCoachService(this.userId, service);
            this.alertService.alert('auto-close', 'Success!', 'Service saved.');
            this.analyticsService.updateCoachingService(service.id);
            this.saving = false;
            this.router.navigate(['services']);
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
EditCoachServiceComponent = __decorate([
    Component({
        selector: 'app-edit-coach-service',
        templateUrl: 'edit.coach.service.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, ActivatedRoute,
        Router,
        FormBuilder,
        AuthService,
        AlertService,
        StorageService,
        DataService,
        AnalyticsService])
], EditCoachServiceComponent);
export { EditCoachServiceComponent };
//# sourceMappingURL=edit.coach.service.component.js.map