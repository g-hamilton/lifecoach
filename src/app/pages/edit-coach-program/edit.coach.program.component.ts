import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { UserAccount } from 'app/interfaces/user.account.interface';

import { DataService } from '../../services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-edit-coach-program',
  templateUrl: 'edit.coach.program.component.html'
})
export class EditCoachProgramComponent implements OnInit, OnDestroy {

  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;

  public browser: boolean;
  public activeRouteProgramId: string;
  public userId: string;
  public account: UserAccount;
  public program: CoachingProgram;
  public isNewProgram: boolean;
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
      if (this.router.url.includes('new-program')) {
        this.isNewProgram = true;
      }
      this.loadUserData();
    }
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.programId) {
        this.activeRouteProgramId = params.programId;
        this.loadProgram();
      }
    });
  }

  loadUserData() {
    this.route.queryParams.subscribe(qP => {
      if (qP.targetUser) { // We're editing the program as an Admin on behalf of a user
        this.userId = qP.targetUser;
        this.getRouteData();
        this.subscriptions.add(
          this.dataService.getUserAccount(this.userId).subscribe(account => {
            if (account) {
              this.account = account;
            }
          })
        );
      } else { // User editing their own program
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

  loadProgram() {
    if (this.userId && this.activeRouteProgramId) {
      // subscribe to program data
      this.subscriptions.add(
        this.dataService.getPrivateProgram(this.userId, this.activeRouteProgramId).subscribe(program => {
          if (program) { // program exists
            this.program = program;
            // console.log('Program loaded:', this.program);
          } else {
            console.log(`Program with id ${this.activeRouteProgramId} does not exist!`);
          }
        })
      );

      // subscribe to program review status
      this.subscriptions.add(
        this.dataService.getProgramReviewRequest(this.activeRouteProgramId).subscribe(data => {
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

  scrollToTop() {
    if (this.browser) {
      (function smoothscroll() {
        const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - (currentScroll / 8));
        }
      })();
    }
  }

  onGoNextEvent(id: number) {
    // console.log('onGoNextEvent:', id);
    this.selectTab(id);
    this.scrollToTop();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
