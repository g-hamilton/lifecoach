import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RegisterModalComponent } from 'app/components/register-modal/register-modal.component';

import { AnalyticsService } from '../../services/analytics.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;
  public browser: boolean;

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private modalService: BsModalService,
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

  onRegister(accountType: string, plan?: string) {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Step 1: Create your account...`,
        successMessage: `Complete your payment to activate your plan...`,
        redirectUrl: `/dashboard`,
        accountType,
        plan
      } as any
    };
    this.bsModalRef = this.modalService.show(RegisterModalComponent, config);
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('pricing-page');
  }

}
