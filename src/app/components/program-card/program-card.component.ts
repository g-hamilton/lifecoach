import {Component, OnInit, Input, OnChanges, Inject, PLATFORM_ID, OnDestroy} from '@angular/core';
import { CurrenciesService } from 'app/services/currencies.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss']
})
export class ProgramCardComponent implements OnInit, OnDestroy {

  @Input() program: any;
  @Input() clientCurrency: string;
  @Input() clientCountry: string;
  @Input() rates: any;

  public browser: boolean;

  public programId: string;

  public programObject: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private currenciesService: CurrenciesService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
    }
    if (this.program) {
      this.program.programId ? this.programId = this.program.programId : this.program.objectID ? this.programId = this.program.objectID : this.programId = null;
    }
    // console.log(this.program);
    this.subscriptions.add(
      this.dataService.getPublicProgram(this.programId).subscribe( program => {
        if (program) {
          this.programObject = program;
        }
      })
    );
  }

  get currencySymbol() {
    const c = this.currenciesService.getCurrencies();
    if (!this.clientCurrency) {
      return '';
    }
    if (c != null) {
      return c[this.clientCurrency].symbol;
    }
  }

  get displayFullPrice() {
    if (!this.program.fullPrice || !this.rates || !this.program.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.program.currency === this.clientCurrency) { // no conversion needed
      return this.program.fullPrice;
    }

    amount = Number((this.program.fullPrice / this.rates[this.program.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

    if (!Number.isInteger(amount)) { // if price is not an integer
      const rounded = Math.floor(amount) + .99; // round UP to .99
      amount = rounded;
    }

    return amount;
  }

  get displaySessionPrice() {
    if (!this.program.pricePerSession || !this.rates || !this.program.currency || !this.clientCurrency) {
      return null;
    }

    let amount: number;

    if (this.program.currency === this.clientCurrency) { // no conversion needed
      return this.program.pricePerSession;
    }

    amount = Number((this.program.pricePerSession / this.rates[this.program.currency.toUpperCase()] * this.rates[this.clientCurrency.toUpperCase()]));

    if (!Number.isInteger(amount)) { // if price is not an integer
      const rounded = Math.floor(amount) + .99; // round UP to .99
      amount = rounded;
    }

    return amount;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
