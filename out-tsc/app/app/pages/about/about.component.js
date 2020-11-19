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
import { AnalyticsService } from '../../services/analytics.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
let AboutComponent = class AboutComponent {
    constructor(analyticsService, titleService, metaTagService, document, platformId) {
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.document = document;
        this.platformId = platformId;
    }
    ngOnInit() {
        this.titleService.setTitle('About Lifecoach');
        this.metaTagService.updateTag({ name: 'description', content: 'Discover the global life coaching platform' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('about-page');
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
    }
    ngOnDestroy() {
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('about-page');
    }
};
AboutComponent = __decorate([
    Component({
        selector: 'app-about',
        templateUrl: 'about.component.html',
        styleUrls: ['./about.component.scss']
    }),
    __param(3, Inject(DOCUMENT)),
    __param(4, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [AnalyticsService,
        Title,
        Meta, Object, Object])
], AboutComponent);
export { AboutComponent };
//# sourceMappingURL=about.component.js.map