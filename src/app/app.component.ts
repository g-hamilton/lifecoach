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
    this.analytics.init();

  }
  ngOnInit() {
    if (this.request) { // from server-side, checking URL/headers/User-agent
      const ua = this.request.headers['user-agent'];
      console.log('User Agent\n', ua);
      let browserName = '';
      if (/MSIE (\d+\.\d+);/.test(ua) || (ua.lastIndexOf('Trident/') && ua.lastIndexOf('Edg/') > 0 )) {
        browserName = 'IE';
      } else if (/Firefox[\/\s](\d+\.\d+)/.test(ua)) {
        browserName = 'Firefox';
      } else if (ua.lastIndexOf('Chrome/') > 0) {
        browserName = 'Chrome';
      } else if (ua.lastIndexOf('Safari/') > 0) {
        browserName = 'Safari';
      } // If !IE and !Safari add webp to body and minimize images
      console.log('BrowserName after test\n', browserName);
      try {
        if (browserName !== 'IE' && browserName !== 'Safari') {
          this.r.addClass(this.document.body, 'webp');
          console.log('Class should be added');
        }
      } catch (e) {
        console.log('error on server', e.message);
      }
    } else {
      console.log('CSR');
    }
  }
}
