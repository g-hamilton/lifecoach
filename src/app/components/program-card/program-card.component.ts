import {Component, OnInit, Input, OnChanges, Inject, PLATFORM_ID, OnDestroy} from '@angular/core';
import { CurrenciesService } from 'app/services/currencies.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import {DataService} from '../../services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss']
})
export class ProgramCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() private fetchData: boolean;
  @Input() public previewMode: boolean;
  @Input() public program: CoachingProgram;
  @Input() public formData: FormGroup;
  @Input() public maxDiscount: any;
  @Input() clientCurrency: string;
  @Input() clientCountry: string;
  @Input() rates: any;

  public maxDiscountObj = { max: 0 };
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
    // console.log(this.program);
  }

  ngOnChanges() {
    if (this.fetchData) {
      if (this.program) {
        this.program.programId ? this.programId = this.program.programId : this.program.objectID ? this.programId = this.program.objectID : this.programId = null;
        this.subscriptions.add(
          this.dataService.getPublicProgram(this.programId).subscribe( program => {
            if (program) {
              this.programObject = program;
            }
          })
        );
      }
    }
    if (!this.maxDiscount) {
      this.calcDiscount();
    }
  }

  get formControls(): any {
    return this.formData.controls;
  }

  calcDiscount() {

    if (!this.program || !this.program.pricingStrategy || this.program.pricingStrategy !== 'flexible' ||
    !this.program.fullPrice || !this.program.numSessions || !this.program.pricePerSession) {
      return 0;
    }

    if ((this.program.numSessions * this.program.pricePerSession) <= this.program.fullPrice) {
      return 0;
    }

    const discount = Number((100 - (this.program.fullPrice / (this.program.numSessions * this.program.pricePerSession)) * 100).toFixed());

    // update the max discount if required
    this.maxDiscountObj.max = 0;
    if (discount > this.maxDiscountObj.max) {
      this.maxDiscountObj.max = discount;
    }

    return discount;

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
