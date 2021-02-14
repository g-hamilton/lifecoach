import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-partner-link',
  templateUrl: 'partner.link.component.html',
  styleUrls: ['./partner.link.component.scss']
})
export class PartnerLinkComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public account: UserAccount;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUserData();
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          this.checkPayoutsEnabled();
        }
      })
    );
  }

  checkPayoutsEnabled() {
    this.subscriptions.add(
        this.dataService.getUserAccount(this.userId).subscribe(userAccount => {
            if (userAccount) {
                this.account = userAccount;
                console.log('User Account:', this.account);
            }
          }
        )
      );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
