import { Component, OnInit, Input, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CurrenciesService } from 'app/services/currencies.service';

@Component({
  selector: 'app-select-currency',
  templateUrl: './select-currency.component.html',
  styleUrls: ['./select-currency.component.scss']
})
export class SelectCurrencyComponent implements OnInit {

  @Input() currency: string;
  @Output() currencyEvent = new EventEmitter<string>();

  public browser: boolean;
  public currencies: any;
  public objKeys = Object.keys;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.currencies = this.currenciesService.getCurrencies();
    }
  }

  onChange(ev: any) {
    // console.log(ev.target.value);
    const currency = String(ev.target.value);
    if (currency && this.currencies[currency]) {
      localStorage.setItem('client-currency', currency);
      this.currencyEvent.emit(currency);
    }
  }

}
