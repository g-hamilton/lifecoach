import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';

@Component({
    selector: 'app-rates',
    templateUrl: 'rates.component.html'
})
export class RatesComponent implements OnInit {

    public updatingRates: boolean;
    public rates: any;
    public lastUpdated: Date;
    public objKeys = Object.keys;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private cloudFunctionsService: CloudFunctionsService,
        private alertService: AlertService,
        private dataService: DataService
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.monitorRateData();
        }
    }

    monitorRateData() {
        this.dataService.getPlatformRates().subscribe(rates => {
            if (rates) {
                console.log('Rates:', rates);
                this.rates = rates;
                this.lastUpdated = new Date(rates.timestamp * 1000);
            }
        });
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

}
