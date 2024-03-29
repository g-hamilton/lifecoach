import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

import { UserAccount } from 'app/interfaces/user.account.interface';
import { CurrenciesService } from 'app/services/currencies.service';
import { Subscription } from 'rxjs';
import { SanitisedStripeCharge } from 'app/interfaces/sanitised.stripe.charge.interface';

@Component({
  selector: 'app-receipt',
  templateUrl: 'receipt.component.html'
})
export class ReceiptComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public charge: SanitisedStripeCharge;
  public account: UserAccount;
  public currencies: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private currenciesService: CurrenciesService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      // Import currencies
      this.currencies = this.currenciesService.getCurrencies();
      // Get the payment data
      this.route.params.subscribe(params => {
        const chargeId = params.id;
        if (chargeId) {
          this.subscriptions.add(
            this.authService.getAuthUser().subscribe(user => {
              if (user) {
                this.userId = user.uid;
                this.subscriptions.add(
                  this.dataService.getSuccessfulChargeById(this.userId, chargeId).subscribe(data => {
                    if (data) {
                      this.charge = data;
                      // console.log('Charge:', this.charge);
                    }
                  })
                );

                // Get the user account
                this.subscriptions.add(
                  this.dataService.getUserAccount(this.userId).subscribe(account => {
                    if (account) {
                      this.account = account;
                    }
                  })
                );
              }
            })
          );
        }
      });
    }
  }

  timestampToDate(timestamp: number) {
    // Convert unix timestamp (epoch) to date string
    return new Date(timestamp * 1000).toDateString();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
