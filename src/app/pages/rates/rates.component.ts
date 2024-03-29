import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rates',
  templateUrl: 'rates.component.html'
})
export class RatesComponent implements OnInit, OnDestroy {

  public updatingRates: boolean;
  public rates: any;
  public lastUpdated: Date;
  public sortedKeys = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cloudFunctionsService: CloudFunctionsService,
    private alertService: AlertService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.monitorRateData();
    }
  }

  monitorRateData() {
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          console.log('Rates:', rates);
          this.rates = rates;
          this.lastUpdated = new Date(rates.timestamp * 1000);
          this.sortedKeys = Object.keys(rates)
          .sort();
          // console.log(this.sortedKeys);
        }
      })
    );
  }

  async updateRates() {
    if (!this.updatingRates) {
      this.updatingRates = true;

      const res = await this.cloudFunctionsService.updatePlatformRates() as any;

      if (!res.error) {
        // success
        this.alertService.alert('success-message', 'Success', 'Platform rates updated.');
      } else {
        this.alertService.alert('warning-message', 'Error', `${res.error}`);
      }

      this.updatingRates = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
