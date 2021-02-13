import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-for-partners',
  templateUrl: 'for.partners.component.html',
  styleUrls: ['./for.partners.component.scss']
})
export class ForPartnersComponent implements OnInit, OnDestroy {

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Lifecoach for Partners');
    this.metaTagService.updateTag({name: 'description', content: 'Earn commission by promoting high quality coaching.'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('partners-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }
  }

  onGetStarted() {
    this.analyticsService.clickGetStarted();
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('partners-page');
  }

}
