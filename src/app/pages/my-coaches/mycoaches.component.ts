import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-coaches',
  templateUrl: 'mycoaches.component.html'
})
export class MyCoachesComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public coaches = [] as any[];
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
      this.loadUserData();
    }
  }

  loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(async user => {
        if (user) {
          this.userId = user.uid;

          // Check for coaches
        }
      })
    );
  }

  browseCoaches() {
    this.analyticsService.clickBrowseCoaches();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
