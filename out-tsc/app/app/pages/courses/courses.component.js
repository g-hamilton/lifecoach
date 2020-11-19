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
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
let CoursesComponent = class CoursesComponent {
    constructor(document, platformId, analyticsService, titleService, metaTagService, route, router, transferState, searchService, dataService) {
        this.document = document;
        this.platformId = platformId;
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.route = route;
        this.router = router;
        this.transferState = transferState;
        this.searchService = searchService;
        this.dataService = dataService;
        this.hitsPerPage = 8;
        this.page = 1;
        this.maxSize = 10;
        this.categories = [
            'Business & Career',
            'Health, Fitness & Wellness',
            'Relationship',
            'Money & Financial',
            'Family',
            'Religion & Faith',
            'Retirement',
            'Transformation & Mindset',
            'Relocation',
            'Academic',
            'Holistic',
            'Productivity & Personal Organisation'
        ];
        this.includeTestData = false; // option: true if testing. False in production.
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.titleService.setTitle('Online Coaching Courses');
        this.metaTagService.updateTag({ name: 'description', content: 'Get coached by the best with top rated online coaching courses from Lifecoach.io' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('courses-page');
        if (isPlatformBrowser(this.platformId)) {
            this.analyticsService.pageView();
            // Check for saved client currency & country preference
            const savedClientCurrencyPref = localStorage.getItem('client-currency');
            const savedClientCountryPref = localStorage.getItem('client-country');
            if (savedClientCurrencyPref && savedClientCountryPref) {
                this.clientCurrency = savedClientCurrencyPref;
                this.clientCountry = savedClientCountryPref;
            }
            else {
                this.getClientCurrencyAndCountryFromIP();
            }
        }
        // Check activated query params
        this.route.queryParamMap.subscribe(params => {
            if (params) {
                this.filters = Object.assign(Object.assign({}, params.keys), params);
                if (this.filters.page) {
                    this.page = this.filters.page;
                }
                // Update meta data
                this.updateMeta();
                // Update active page
                this.updateActivePage();
                // Fetch appropriate data, checking state to avoid duplicate calls
                const STATE_KEY = makeStateKey('courses'); // create a key for saving/retrieving a state
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
        // Monitor platform rates for realtime price calculations
        this.subscriptions.add(this.dataService.getPlatformRates().subscribe(rates => {
            if (rates) {
                // console.log('Rates:', rates);
                this.rates = rates;
            }
        }));
    }
    getClientCurrencyAndCountryFromIP() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch('https://ipapi.co/json/');
            // console.log(res.status);
            if (res.status === 200) {
                const json = yield res.json();
                if (json.currency) {
                    this.clientCurrency = json.currency;
                    localStorage.setItem('client-currency', String(json.currency));
                }
                if (json.country) {
                    this.clientCountry = json.country;
                    localStorage.setItem('client-country', String(json.country));
                }
            }
        });
    }
    onManualCurrencyChange(ev) {
        console.log('User changed currency to:', ev);
        this.clientCurrency = ev;
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
        // If category is defined
        if (this.filters.params.category) {
            this.titleService.setTitle(`Online Coaching Courses on ${cat}`);
            this.metaTagService.updateTag({ name: 'description', content: `Top rated online coaching courses on ${cat.toLowerCase()}` });
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
        console.log('Courses component received new page request:', event);
        const newParams = Object.assign({}, this.filters.params);
        newParams.page = event;
        this.router.navigate(['/courses'], { queryParams: newParams });
    }
    getSearchResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCourses(this.hitsPerPage, this.page, this.filters, this.includeTestData);
            // console.log('Search results:', res);
            this.totalHits = res.nbHits;
            this.hits = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('courses-page');
    }
};
CoursesComponent = __decorate([
    Component({
        selector: 'app-courses',
        templateUrl: 'courses.component.html',
        styleUrls: ['./courses.component.scss']
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, AnalyticsService,
        Title,
        Meta,
        ActivatedRoute,
        Router,
        TransferState,
        SearchService,
        DataService])
], CoursesComponent);
export { CoursesComponent };
//# sourceMappingURL=courses.component.js.map