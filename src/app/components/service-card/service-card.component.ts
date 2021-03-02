import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CoachingService } from 'app/interfaces/coaching.service.interface';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent implements OnInit, OnChanges {

  @Input() public service: CoachingService;

  public objKeys = Object.keys;

  public maxDiscountObj = { max: 0 };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.calcDiscount();
  }

  calcDiscount() {

    if (!this.service || !this.service.pricing) {
      return null;
    }

    const pricing = this.service.pricing;

    // find the lowest number of sessions in the pricing
    const sessions = [];
    Object.keys(pricing).forEach(i => sessions.push(pricing[i].numSessions));
    sessions.sort();
    // console.log(sessions);
    const lowest = sessions[0];
    // console.log(lowest);

    // calculate the base price per session
    const basePricePerSession = Number((pricing[lowest].price / pricing[lowest].numSessions));
    // console.log(basePricePerSession);

    Object.keys(pricing).forEach(i => {
      if (i === lowest) { // this is the lowest number of sessions so there can't be a discount here
        return null;
      }
      // calculate this package price per session
      const thisPricePerSession = Number((pricing[i].price / pricing[i].numSessions));
      // console.log(thisPricePerSession);

      // calculate this discount
      const discount = Number((100 - ((thisPricePerSession  / basePricePerSession) * 100)).toFixed());

      // update the max discount if required
      this.maxDiscountObj.max = 0;
      if (discount > this.maxDiscountObj.max) {
        this.maxDiscountObj.max = discount;
      }
    });
  }

}
