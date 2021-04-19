import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RegisterModalComponent } from 'app/components/register-modal/register-modal.component';

@Component({
  selector: 'app-for-partners',
  templateUrl: 'for.partners.component.html',
  styleUrls: ['./for.partners.component.scss']
})
export class ForPartnersComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private modalService: BsModalService,
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

  onRegister(plan?: string) {
    // pop register modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: `Becoming a Lifecoach Promotional Partner takes seconds! Enter your email to get a secure signup link, then follow the link in the email to sign in...`,
        successMessage: null,
        redirectUrl: null,
        accountType: 'partner',
        plan
      } as any
    };
    this.bsModalRef = this.modalService.show(RegisterModalComponent, config);
  }

  clickEvent(buttonId: string) {
    this.analyticsService.clickButton(buttonId);
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('partners-page');
  }

}
