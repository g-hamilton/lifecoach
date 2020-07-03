import { Injectable } from '@angular/core';

import * as countryFlagEmoji from 'country-flag-emoji'; // https://github.com/risan/country-flag-emoji

import { EmojiCountry } from '../interfaces/emoji.country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor() { }

  getCountryList() {
    // Returns a sorted list of countries along with codes & emojis from the country flag emoji library.
    const countries: EmojiCountry[] = countryFlagEmoji.list;
    countries.sort((a, b) => {
      const A = a.name.toLowerCase();
      const B = b.name.toLowerCase();
      return (A < B) ? -1 : (A > B) ? 1 : 0;
    });
    return countries;
  }

  getDefaultCountry() {
    // Returns a default emoji country (defaults to United Kingdom).
    const defaultCountry: EmojiCountry = countryFlagEmoji.get('GB');
    return defaultCountry;
  }

  getCountryByCode(countryCode: string) {
    // Return an emoji country matching the defined country code.
    const country: EmojiCountry = countryFlagEmoji.get(countryCode);
    return country;
  }

}
