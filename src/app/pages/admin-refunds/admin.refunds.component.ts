import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {environment} from '../../../environments/environment';

import * as algoliasearch from 'algoliasearch/lite';
const searchClient = algoliasearch(
    environment.algoliaApplicationID,
    environment.algoliaApiKey
);

import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-admin-refunds',
  templateUrl: 'admin.refunds.component.html'
})
export class AdminRefundsComponent implements OnInit {

    public browser: boolean;
    public userId: string;
    public requestedRefunds: any;
    public aisConfig = {
        indexName: 'prod_REFUNDS',
        searchClient
    };

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private cloudFunctionsService: CloudFunctionsService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }

    timestampToDate(timestamp: number) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }

    async approveRefund(refundRequest: any) {
        console.log(refundRequest);
        if (refundRequest) {
            const res = await this.cloudFunctionsService.approveRefund(refundRequest) as any;
            console.log(res);
            if (res.error) {
                this.alertService.alert('warning-message', 'Oops', JSON.stringify(res.error));
                return;
            }
            this.alertService.alert('success-message', 'Success!', 'Refund approved.');
        } else {
            console.log('No refund request argument!');
        }
    }

}
