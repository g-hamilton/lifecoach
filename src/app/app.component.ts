import {Component, Inject, PLATFORM_ID} from '@angular/core';

import {AuthService} from './services/auth.service';
import {AnalyticsService} from './services/analytics.service';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public userAuthorised = false;

  constructor(
    private authService: AuthService,
    private analytics: AnalyticsService,
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(Platform) private testPlatform: any
  ) {

    // Initialise analytics
    this.analytics.init();
    if (testPlatform.isBrowser) {
      if (!testPlatform.TRIDENT && !testPlatform.SAFARI) {
        document.body.classList.add('webp');
      } else {
        console.log('changed body');
      }
    }
    this.checkBrowser();
  }

  checkBrowser() {
  }

}
