import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { AnalyticsService } from '../../services/analytics.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-contactpage',
  templateUrl: 'contactpage.component.html',
  styleUrls: ['./contactpage.component.scss']
})
export class ContactPageComponent implements OnInit, OnDestroy {

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Contact Lifecoach');
    this.metaTagService.updateTag({name: 'description', content: 'Reach out to the Lifecoach Team'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('contact-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('contact-page');
  }

}
