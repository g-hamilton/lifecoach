var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
let ForPublishersComponent = class ForPublishersComponent {
    constructor(analyticsService, titleService, metaTagService, document, platformId) {
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.document = document;
        this.platformId = platformId;
    }
    ngOnInit() {
        this.titleService.setTitle('Lifecoach for Publishers');
        this.metaTagService.updateTag({ name: 'description', content: 'Earn commission by promoting high quality coaching.' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('publishers-page');
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
    }
    ngOnDestroy() {
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('publishers-page');
    }
};
ForPublishersComponent = __decorate([
    Component({
        selector: 'app-for-publishers',
        templateUrl: 'for.publishers.component.html',
        styleUrls: ['./for.publishers.component.scss']
    }),
    __param(3, Inject(DOCUMENT)),
    __param(4, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [AnalyticsService,
        Title,
        Meta, Object, Object])
], ForPublishersComponent);
export { ForPublishersComponent };
//# sourceMappingURL=for.publishers.component.js.map