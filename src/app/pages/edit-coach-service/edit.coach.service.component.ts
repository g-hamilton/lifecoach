import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { UserAccount } from 'app/interfaces/user.account.interface';

import { DataService } from '../../services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { CoachingService } from 'app/interfaces/coaching.service.interface';

import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-edit-coach-service',
  templateUrl: 'edit.coach.service.component.html'
})
export class EditCoachServiceComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;

  public browser: boolean;
  public activeRouteServiceId: string;
  public userId: string;
  public account: UserAccount;
  public service: CoachingService;
  public isNewService: boolean;
  public reviewRequest: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      if (this.router.url.includes('new-service')) {
        this.isNewService = true;
      }
      this.loadUserData();
    }
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.serviceId) {
        this.activeRouteServiceId = params.serviceId;
        this.loadService();
      }
    });
  }

  loadUserData() {
    this.route.queryParams.subscribe(qP => {
      if (qP.targetUser) { // We're editing the service as an Admin on behalf of a user
        this.userId = qP.targetUser;
        this.getRouteData();
        this.subscriptions.add(
          this.dataService.getUserAccount(this.userId).subscribe(account => {
            if (account) {
              this.account = account;
            }
          })
        );
      } else { // User editing their own service
        this.subscriptions.add(
          this.authService.getAuthUser().subscribe(user => {
            if (user) {
              this.userId = user.uid;
              this.getRouteData();
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

  loadService() {
    if (this.userId && this.activeRouteServiceId) {
      // subscribe to service data
      this.subscriptions.add(
        this.dataService.getPrivateService(this.userId, this.activeRouteServiceId).subscribe(service => {
          if (service) { // service exists
            this.service = service;
            // console.log('Service loaded:', this.service);
          } else {
            console.log(`Service with id ${this.activeRouteServiceId} does not exist!`);
          }
        })
      );

      // subscribe to service review status
      this.subscriptions.add(
        this.dataService.getServiceReviewRequest(this.activeRouteServiceId).subscribe(data => {
          if (data) {
            this.reviewRequest = data;
          }
        })
      );
    }
  }

  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  onGoNextEvent(id: number) {
    // console.log('onGoNextEvent:', id);
    this.selectTab(id);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
