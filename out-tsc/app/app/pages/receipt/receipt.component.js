var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { Subscription } from 'rxjs';
let ReceiptComponent = class ReceiptComponent {
    constructor(platformId, authService, dataService, router, route, currenciesService) {
        this.platformId = platformId;
        this.authService = authService;
        this.dataService = dataService;
        this.router = router;
        this.route = route;
        this.currenciesService = currenciesService;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            // Import currencies
            this.currencies = this.currenciesService.getCurrencies();
            // Get the payment data
            this.route.params.subscribe(params => {
                const paymentIntentId = params.id;
                if (paymentIntentId) {
                    this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
                        if (user) {
                            this.userId = user.uid;
                            this.subscriptions.add(this.dataService.getSuccessfulPaymentIntent(this.userId, paymentIntentId).subscribe(payInt => {
                                if (payInt) {
                                    this.purchasedItem = payInt;
                                    console.log('Purchased item:', this.purchasedItem);
                                }
                            }));
                            // Get the user account
                            this.subscriptions.add(this.dataService.getUserAccount(this.userId).subscribe(account => {
                                if (account) {
                                    this.account = account;
                                }
                            }));
                        }
                    }));
                }
            });
        }
    }
    timestampToDate(timestamp) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
ReceiptComponent = __decorate([
    Component({
        selector: 'app-receipt',
        templateUrl: 'receipt.component.html'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AuthService,
        DataService,
        Router,
        ActivatedRoute,
        CurrenciesService])
], ReceiptComponent);
export { ReceiptComponent };
//# sourceMappingURL=receipt.component.js.map