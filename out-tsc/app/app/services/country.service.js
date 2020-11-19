var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import * as countryFlagEmoji from 'country-flag-emoji'; // https://github.com/risan/country-flag-emoji
let CountryService = class CountryService {
    constructor() { }
    getCountryList() {
        // Returns a sorted list of countries along with codes & emojis from the country flag emoji library.
        const countries = countryFlagEmoji.list;
        countries.sort((a, b) => {
            const A = a.name.toLowerCase();
            const B = b.name.toLowerCase();
            return (A < B) ? -1 : (A > B) ? 1 : 0;
        });
        return countries;
    }
    getDefaultCountry() {
        // Returns a default emoji country (defaults to United Kingdom).
        const defaultCountry = countryFlagEmoji.get('GB');
        return defaultCountry;
    }
    getCountryByCode(countryCode) {
        // Return an emoji country matching the defined country code.
        const country = countryFlagEmoji.get(countryCode);
        return country;
    }
};
CountryService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [])
], CountryService);
export { CountryService };
//# sourceMappingURL=country.service.js.map