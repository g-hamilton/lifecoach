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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { PriceValidator } from 'app/custom-validators/price.validator';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
let CoursePricingComponent = class CoursePricingComponent {
    constructor(platformId, formBuilder, authService, dataService, alertService, analyticsService, router) {
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.dataService = dataService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.router = router;
        this.baseMinPrice = 1;
        this.baseMaxPrice = 10000;
        this.baseCurrency = 'GBP';
        this.errorMessages = {
            price: {
                required: `Price is required for paid courses.`,
                notNumber: `Price must be a number`,
                belowMin: `Please enter a price above ${this.minPrice}.`,
                aboveMax: `Price enter a price below ${this.maxPrice}`
            }
        };
        this.objKeys = Object.keys;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.minPrice = this.baseMinPrice;
            this.maxPrice = this.baseMaxPrice;
            this.buildPricingForm();
            this.subscriptions.add(this.pricingForm.get('pricingStrategy').valueChanges
                .subscribe(value => {
                this.pricingForm.get('price').updateValueAndValidity();
                this.pricingForm.get('currency').updateValueAndValidity();
            }));
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
        this.subscriptions.add(this.dataService.getUserAccount(this.userId).subscribe(account => {
            if (account) {
                this.account = account;
            }
        }));
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
    conditionallyRequiredValidator(formControl) {
        if (!formControl.parent) {
            return null;
        }
        if (formControl.parent.get('pricingStrategy').value === 'paid') {
            return Validators.required(formControl);
        }
        return null;
    }
    importCourseData() {
        let defaultCurrency;
        const savedClientCurrencyPref = localStorage.getItem('client-currency');
        savedClientCurrencyPref ? defaultCurrency = savedClientCurrencyPref : defaultCurrency = 'USD';
        this.pricingForm.patchValue({
            courseId: this.course.courseId,
            pricingStrategy: this.course.pricingStrategy ? this.course.pricingStrategy : 'free',
            price: this.course.price ? this.course.price : '',
            currency: this.course.currency ? this.course.currency : defaultCurrency
        });
    }
    get pricingF() {
        return this.pricingForm.controls;
    }
    showError(control, error) {
        if (this.errorMessages[control][error]) {
            return this.errorMessages[control][error];
        }
        return 'Invalid input';
    }
    onCurrencyEvent(event) {
        console.log('Currency event:', event);
        if (event) {
            this.pricingForm.patchValue({
                currency: event
            });
        }
    }
    onStrategyChange(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(ev.target.value);
            // if account stripe id continue otherwise divert to setup stripe first
            if (ev.target.value === 'paid' && this.account && this.account.stripeUid) {
                // do nothing as form will be updated to paid now
            }
            else {
                // reset form back to free as paid strategy is not allowed with a stripe account
                this.pricingForm.patchValue({ pricingStrategy: 'free' });
                // alert
                const res = yield this.alertService.alert('title-and-text', 'Just a second!', `Before you can create a paid course, you need to enable payments
      so you can get paid.`, `Enable Now`);
                if (res.value) {
                    this.router.navigate(['/account', 'payout-settings']); // navigate to setup stripe
                }
            }
        });
    }
    onDisableInstructorSupportToggle(ev) {
        this.pricingForm.patchValue({ disableInstructorSupport: ev.currentValue });
    }
    onDisableAllDiscussionToggle(ev) {
        this.pricingForm.patchValue({ disableAllDiscussion: ev.currentValue });
    }
    onIncludeInCoachingForCoachesToggle(ev) {
        this.pricingForm.patchValue({ includeInCoachingForCoaches: ev.currentValue });
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
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
                this.pricingForm.patchValue({ pricingStrategy: 'free' }); // should already be done by component but double safe!
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
            yield this.dataService.savePrivateCourse(this.userId, this.course);
            this.alertService.alert('auto-close', 'Success!', 'Course saved.');
            this.saving = false;
            this.analyticsService.editCourseOptions();
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CoursePricingComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CoursePricingComponent.prototype, "course", void 0);
CoursePricingComponent = __decorate([
    Component({
        selector: 'app-course-pricing',
        templateUrl: './course-pricing.component.html',
        styleUrls: ['./course-pricing.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, FormBuilder,
        AuthService,
        DataService,
        AlertService,
        AnalyticsService,
        Router])
], CoursePricingComponent);
export { CoursePricingComponent };
//# sourceMappingURL=course-pricing.component.js.map