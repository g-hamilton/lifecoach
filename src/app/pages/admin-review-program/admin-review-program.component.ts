import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
import { AdminProgramReviewRequest } from 'app/interfaces/admin.program.review.interface';
import { AlertService } from 'app/services/alert.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-admin-review-program',
  templateUrl: './admin-review-program.component.html',
  styleUrls: ['./admin-review-program.component.scss']
})
export class AdminReviewProgramComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private programId: string;
  public program: CoachingProgram;
  public reviewRequest: AdminProgramReviewRequest;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private alertService: AlertService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getRouteData();
    }
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      if (params.programId) {
        this.programId = params.programId;
        this.loadReviewRequest();
      }
    });
  }

  loadReviewRequest() {
    this.subscriptions.add(
      this.dataService.getProgramReviewRequest(this.programId).subscribe(data => {
        if (data) {
          this.reviewRequest = data;
          if (this.reviewRequest.sellerUid) {
            this.loadProgram();
          } else {
            this.alertService.alert('warning-message', 'No seller UID - cannot load course!');
          }
        }
      })
    );
  }

  loadProgram() {
    this.subscriptions.add(
      this.dataService.getPrivateProgram(this.reviewRequest.sellerUid, this.programId).subscribe(data => {
        if (data) {
          this.program = data;
          // console.log('program loaded:', this.program);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
