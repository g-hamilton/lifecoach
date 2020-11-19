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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';
let BrowseComponent = class BrowseComponent {
    constructor(analyticsService, titleService, metaTagService, route, router, transferState, searchService, document, platformId) {
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.route = route;
        this.router = router;
        this.transferState = transferState;
        this.searchService = searchService;
        this.document = document;
        this.platformId = platformId;
        this.hitsPerPage = 6;
        this.page = 1;
        this.maxSize = 10;
    }
    ngOnInit() {
        console.log('Browse component init');
        this.titleService.setTitle('Find a Life Coach');
        this.metaTagService.updateTag({ name: 'description', content: 'Top rated life coaches in your area' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('browse-page');
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
        }
        // Check activated query params
        this.route.queryParamMap.subscribe(params => {
            if (params) {
                this.filters = Object.assign(Object.assign({}, params.keys), params);
                // console.log(this.filters);
                if (this.filters.page) {
                    this.page = this.filters.page;
                }
                // Update meta data
                this.updateMeta();
                // Update active page
                this.updateActivePage();
                // Fetch appropriate data, checking state to avoid duplicate calls
                const STATE_KEY = makeStateKey('profile'); // create a key for saving/retrieving a state
                const StateData = this.transferState.get(STATE_KEY, null); // checking if data in the storage exists
                if (StateData == null) { // if data state does not exist - retrieve it from the api
                    this.getSearchResults()
                        .then((results) => {
                        if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                            this.transferState.set(STATE_KEY, results);
                        }
                    });
                }
                else { // if data state exists retrieve it from the state storage
                    this.hits = StateData;
                    this.transferState.remove(STATE_KEY);
                }
            }
        });
    }
    updateMeta() {
        let cat = this.filters.params.category;
        // If category is defined do some string cleanups
        if (cat) {
            cat = cat.toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' '); // convert to title case
        }
        // If only category is defined
        if (this.filters.params.category && !this.filters.params.country) {
            this.titleService.setTitle(`Find A ${cat} Coach`);
            this.metaTagService.updateTag({ name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in your area` });
        }
        // If both category and country are defined but not city
        if (this.filters.params.category && this.filters.params.country && !this.filters.params.city) {
            this.titleService.setTitle(`Find A ${cat} Coach in ${this.filters.params.country}`);
            this.metaTagService.updateTag({ name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in ${this.filters.params.country}` });
        }
        // If category, country and city are defined
        if (this.filters.params.category && this.filters.params.country && this.filters.params.city) {
            this.titleService.setTitle(`Find A ${cat} Coach in ${this.filters.params.city}, ${this.filters.params.country}`);
            this.metaTagService.updateTag({ name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in ${this.filters.params.city}, ${this.filters.params.country}` });
        }
    }
    updateActivePage() {
        const p = this.filters.params.page;
        if (p) {
            this.page = Number(p);
        }
    }
    receivePageUpdate(event) {
        // Page has been changed by the navigator component
        console.log('Browse component received new page request:', event);
        const newParams = Object.assign({}, this.filters.params);
        newParams.page = event;
        this.router.navigate(['/coaches'], { queryParams: newParams });
    }
    onCountriesUpdated(event) {
        this.coachCountries = event;
    }
    onCitiesUpdated(event) {
        this.coachCities = event;
    }
    getSearchResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCoaches(this.hitsPerPage, this.page, this.filters);
            this.totalHits = res.nbHits;
            this.hits = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    ngOnDestroy() {
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('browse-page');
    }
};
BrowseComponent = __decorate([
    Component({
        selector: 'app-browse',
        templateUrl: 'browse.component.html',
        styleUrls: ['./browse.component.scss']
    }),
    __param(7, Inject(DOCUMENT)),
    __param(8, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [AnalyticsService,
        Title,
        Meta,
        ActivatedRoute,
        Router,
        TransferState,
        SearchService, Object, Object])
], BrowseComponent);
export { BrowseComponent };
//# sourceMappingURL=browse.component.js.map