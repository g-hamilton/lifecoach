import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {

  public browser: boolean;

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Lifecoach for Coaches');
    this.metaTagService.updateTag({name: 'description', content: 'Join the fastest growing digital coaching community.'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('pricing-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
      this.browser = true;
    }
  }

  clickEvent(buttonId: string) {
    this.analyticsService.clickButton(buttonId);
  }

  onGetStarted() {
    this.analyticsService.clickGetStarted();
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('pricing-page');
  }

}
