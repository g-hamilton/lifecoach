import {Component, OnInit, Input, OnChanges, Inject, PLATFORM_ID, OnDestroy} from '@angular/core';
import { CurrenciesService } from 'app/services/currencies.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() course: any;
  @Input() clientCurrency: string;
  @Input() clientCountry: string;
  @Input() rates: any;

  public browser: boolean;

  public courseId: string;

  public courseObject: any;

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
    if (this.course) {
      this.course.courseId ? this.courseId = this.course.courseId : this.course.objectID ? this.courseId = this.course.objectID : this.courseId = null;
    }
    // console.log(this.course);
    this.subscriptions.add(
      this.dataService.getPublicCourse(this.courseId).subscribe( course => {
        if (course) {
          this.courseObject = course;
        }
      })
    );
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

    let amount: number;

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
