import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-my-programs',
  templateUrl: 'myprograms.component.html'
})
export class MyProgramsComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public purchasedPrograms = [] as CoachingProgram[]; // purchased programs as buyer
  public objKeys = Object.keys;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private alertService: AlertService,
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
          console.log('THIS IS USER', user);
          this.userId = user.uid;
          const token = await user.getIdTokenResult(true);
          console.log('Claims:', token.claims);

          // Check for purchased programs
          this.subscriptions.add(
            this.dataService.getPurchasedPrograms(this.userId).subscribe(async programIds => {
              if (programIds) {
                console.log('Enrolled In Program Ids:', programIds);

                // force refresh the user claims on a change to purchased programs
                // trying to avoid "insufficient permissions" error when going to my-programs immediately afer program purchase 
                const token = await user.getIdTokenResult(true);
                console.log('Claims:', token.claims);

                this.purchasedPrograms = []; // reset
                programIds.forEach((o: any, index) => { // fetch and monitor live / latest program info
                  this.subscriptions.add(
                    this.dataService.getUnlockedPublicProgram(o.id).subscribe(program => {
                      if (program) {
                        this.purchasedPrograms.push(program);
                        // this.calcProgramProgress(program, index); TODO
                      }
                    })
                  );
                });
              }
            })
          );
        }
      })
    );
  }

  browsePrograms() {
    this.analyticsService.clickBrowsePrograms();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
