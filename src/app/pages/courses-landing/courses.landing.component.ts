import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-courses-landing',
  templateUrl: 'courses.landing.component.html',
  styleUrls: ['./courses.landing.scss']
})
export class CoursesLandingComponent implements OnInit, OnDestroy {

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Publish Coaching eCourses');
    this.metaTagService.updateTag({name: 'description', content: 'Create & Sell Coaching eCourses With Lifecoach'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('courses-landing-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('courses-landing-page');
  }

}
