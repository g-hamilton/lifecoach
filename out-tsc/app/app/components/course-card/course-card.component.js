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
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CurrenciesService } from 'app/services/currencies.service';
import { isPlatformBrowser } from '@angular/common';
let CourseCardComponent = class CourseCardComponent {
    constructor(platformId, currenciesService) {
        this.platformId = platformId;
        this.currenciesService = currenciesService;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
        if (this.course) {
            this.course.courseId ? this.courseId = this.course.courseId : this.course.objectID ? this.courseId = this.course.objectID : this.courseId = null;
        }
    }
    ngOnChanges() {
        // console.log('clientcurrency', this.clientCurrency);
        // console.log('rates', this.rates);
    }
    get currencySymbol() {
        const c = this.currenciesService.getCurrencies();
        return c[this.clientCurrency].symbol;
    }
    get displayPrice() {
        if (!this.course.price || !this.rates || !this.course.currency || !this.clientCurrency) {
            return null;
        }
        let amount;
        if (this.course.currency === this.clientCurrency) { // no conversion needed
            return this.course.price;
        }
        // tslint:disable-next-line: max-line-length
        amount = Number((this.course.price / this.rates[this.course.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));
        if (!Number.isInteger(amount)) { // if price is not an integer
            const rounded = Math.floor(amount) + .99; // round UP to .99
            amount = rounded;
        }
        return amount;
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseCardComponent.prototype, "course", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseCardComponent.prototype, "clientCurrency", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseCardComponent.prototype, "clientCountry", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseCardComponent.prototype, "rates", void 0);
CourseCardComponent = __decorate([
    Component({
        selector: 'app-course-card',
        templateUrl: './course-card.component.html',
        styleUrls: ['./course-card.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, CurrenciesService])
], CourseCardComponent);
export { CourseCardComponent };
//# sourceMappingURL=course-card.component.js.map