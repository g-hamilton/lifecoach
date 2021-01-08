import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

/*
  This component is designed to be a re-usable modal.
  Allows users to manage sessions from multiple places in the app's UI
*/

@Component({
  selector: 'app-session-manager',
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.scss']
})
export class SessionManagerComponent implements OnInit {

  // modal config - pass the data in through the modalOptions
  private coachId: string;
  private clientId: string;
  private programId: string;

  // component
  public browser: boolean;
  public userId: string;
  private subscriptions: Subscription = new Subscription();
  public completing: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private authService: AuthService,
    public cloudService: CloudFunctionsService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      // this.getUser();
    }
  }

  getUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            // do anything that requires a user id
          }
        }, error => console.log('error logger', error.message))
    );
  }

  async markComplete() {
    this.completing = true;

    // safety checks
    if (!this.coachId) {
      this.completing = false;
      this.alertService.alert('warning-message', 'Oops', 'Error: Missing coach ID. Please contact support');
      return;
    }

    if (!this.clientId) {
      this.completing = false;
      this.alertService.alert('warning-message', 'Oops', 'Error: Missing client ID. Please contact support');
      return;
    }

    if (!this.programId) {
      this.completing = false;
      this.alertService.alert('warning-message', 'Oops', 'Error: Missing program ID. Please contact support');
      return;
    }

    const data = {
      coachId: this.coachId,
      clientId: this.clientId,
      programId: this.programId
    };
    const res = await this.cloudService.coachMarkSessionComplete(data) as any;
    if (res.error) { // error
      this.completing = false;
      this.bsModalRef.hide();
      this.alertService.alert('warning-message', 'Oops', `Error: ${res.error}. Please contact hello@lifecoach.io for support.`);
      return;
    }
    // success
    this.completing = false;
    this.bsModalRef.hide();
    this.alertService.alert('success-message', 'Success!', `Session complete.`);
  }

}
