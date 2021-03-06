import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { CrmPeopleService } from 'app/services/crm-people.service';

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
    private analyticsService: AnalyticsService,
    private crmPeopleService: CrmPeopleService
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
            // console.log('user:', this.userId);
            this.monitorUserCoaches();
        }
      })
    );
  }

  monitorUserCoaches() {
    this.subscriptions.add(
        this.crmPeopleService.getOwnCoaches(this.userId).subscribe(data => {
            if (data) {
                // fetch coach profiles
                const profiles = [] as CoachProfile[];
                data.forEach(i => {
                    this.subscriptions.add(
                        this.dataService.getPublicCoachProfile(i.coachUid)
                        .pipe(take(1))
                        .subscribe(profile => {
                            if (profile) {
                                profile.objectID = i.coachUid; // card component needs this
                                profiles.push(profile);
                                // console.log('coach profiles:', profiles);
                                this.coaches = profiles;
                            }
                        })
                    );
                });
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
