import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
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

  // modal config
  public coachId: string; // pass the data in through the modalOptions

  // component
  public browser: boolean;
  public userId: string;
  private subscriptions: Subscription = new Subscription();
  public completing: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUser();
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

  markComplete() {
    // todo
  }

}
