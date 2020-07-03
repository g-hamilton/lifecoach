import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

import { UserAccount } from 'app/interfaces/user.account.interface';
import { CurrenciesService } from 'app/services/currencies.service';

@Component({
    selector: 'app-receipt',
    templateUrl: 'receipt.component.html'
})
export class ReceiptComponent implements OnInit {

    public browser: boolean;
    private userId: string;
    public purchasedItem: any;
    public account: UserAccount;
    public currencies: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private authService: AuthService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute,
        private currenciesService: CurrenciesService
    ) { }

    ngOnInit() {

        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            // Import currencies
            this.currencies = this.currenciesService.getCurrencies();
            // Get the payment data
            this.route.params.subscribe(params => {
                const paymentIntentId = params.id;
                if (paymentIntentId) {
                    this.authService.getAuthUser().subscribe(user => {
                        if (user) {
                            this.userId = user.uid;
                            this.dataService.getSuccessfulPaymentIntent(this.userId, paymentIntentId).subscribe(payInt => {
                                if (payInt) {
                                    this.purchasedItem = payInt;
                                    console.log('Purchased item:', this.purchasedItem);
                                }
                            });
                            // Get the user account
                            this.dataService.getUserAccount(this.userId).subscribe(account => {
                                if (account) {
                                    this.account = account;
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    timestampToDate(timestamp: number) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }

}
