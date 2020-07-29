import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'admin.uploader.component.html'
})
export class AdminUploaderComponent implements OnInit, OnDestroy {

  public browser: boolean;
  public userId: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.subscriptions.add(
        this.authService.getAuthUser().subscribe(user => {
          if (user) {
            this.userId = user.uid;
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
