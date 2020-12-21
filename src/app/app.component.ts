import {Component, Inject, OnInit, Optional, PLATFORM_ID, Renderer2} from '@angular/core';

import {AuthService} from './services/auth.service';
import {AnalyticsService} from './services/analytics.service';
import { Platform } from '@angular/cdk/platform';
import {REQUEST} from '@nguniversal/express-engine/tokens';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private analytics: AnalyticsService,
    @Optional()@Inject(REQUEST) private request: Request,
    @Optional()@Inject(DOCUMENT) private document, private r: Renderer2
  ) {
    // Initialise analytics
    // this.analytics.init();
    // if (testPlatform.isBrowser) {
    //   if (!testPlatform.TRIDENT && !testPlatform.SAFARI) {
    //     document.body.classList.add('webp');
    //   } else {
    //     console.log('changed body');
    //   }
    // }
    // this.checkBrowser();

    //2 variant
    // constructor(@Optional() @Inject(REQUEST) private request: any,
    // @Optional() @Inject(RESPONSE) private response: any,
    // @Inject(PLATFORM_ID) private platformId: Object)
    // {
    //   if (isPlatformServer(this.platformId))
    //   {
    //     console.log(this.request.get('host’)); // host on the server
    //   } else
    //   {
    //     console.log(document.location.hostname); // host on the browser
    //   }
    // }
  }
  ngOnInit() {
    if (this.request) {
      console.log(this.request.headers['user-agent']);
      console.log(this.request.headers);
      try {
        // document.body.classList.add('someclass'); Не работает
        this.r.addClass(this.document.body, 'testClass');
        console.log('someclass added');
      } catch (e) {
        console.log(e.message);
      }
    } else {
      console.log('no user agent');

    }
  }
  checkBrowser() {
  }

}
