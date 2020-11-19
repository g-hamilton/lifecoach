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
import { Component, Input, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CurrenciesService } from 'app/services/currencies.service';
let SelectCurrencyComponent = class SelectCurrencyComponent {
    constructor(platformId, currenciesService) {
        this.platformId = platformId;
        this.currenciesService = currenciesService;
        this.currencyEvent = new EventEmitter();
        this.objKeys = Object.keys;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.currencies = this.currenciesService.getCurrencies();
        }
    }
    onChange(ev) {
        // console.log(ev.target.value);
        const currency = String(ev.target.value);
        if (currency && this.currencies[currency]) {
            localStorage.setItem('client-currency', currency);
            this.currencyEvent.emit(currency);
        }
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], SelectCurrencyComponent.prototype, "currency", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], SelectCurrencyComponent.prototype, "currencyEvent", void 0);
SelectCurrencyComponent = __decorate([
    Component({
        selector: 'app-select-currency',
        templateUrl: './select-currency.component.html',
        styleUrls: ['./select-currency.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, CurrenciesService])
], SelectCurrencyComponent);
export { SelectCurrencyComponent };
//# sourceMappingURL=select-currency.component.js.map