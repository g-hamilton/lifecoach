import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';

import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-share',
  templateUrl: 'share.component.html'
})
export class ShareComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public profile: CoachProfile;
  public generatingSmartlink: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private cloudFunctionsService: CloudFunctionsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();

      // Get user auth data
      this.subscriptions.add(
        this.authService.getAuthUser()
          .subscribe(user => {
            if (user) {
              this.userId = user.uid;
              this.subscriptions.add(
                this.dataService.getCoachProfile(this.userId).subscribe(profile => {
                  if (profile) { // a coach profile with shortUrl exists for this user
                    this.profile = profile;
                  }
                })
              );
            }
          })
      );
    }
  }

  async generateSmartlink() {
    if (!this.generatingSmartlink) {
      this.generatingSmartlink = true;

      if (!this.profile.profileUrl) { // catch the case where profileUrl is not defined
        this.profile.profileUrl = `https://lifecoach.io/coach/${this.userId}`;
        this.dataService.saveCoachProfile(this.userId, this.profile);
      }

      const res = await this.cloudFunctionsService.generateShortUrl(this.userId, this.profile.profileUrl) as any;

      if (!res.error) {
        // success
        console.log(res);
      } else {
        // alert res.error.
      }

      this.generatingSmartlink = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
