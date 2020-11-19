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
let HomeSearchResultsComponent = class HomeSearchResultsComponent {
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
        this.coachHitsPerPage = 3;
        this.coachPage = 1;
        this.maxSize = 10;
        this.courseHitsPerPage = 4;
        this.coursePage = 1;
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.titleService.setTitle('Search Results');
        this.metaTagService.updateTag({ name: 'description', content: 'Coaches & Self-Study Coaching Courses' });
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.add('home-search-results-page');
        // Register a page view if we're in the browser (not SSR)
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
        // Monitor platform rates for realtime price calculations
        this.subscriptions.add(this.dataService.getPlatformRates().subscribe(rates => {
            if (rates) {
                // console.log('Rates:', rates);
                this.rates = rates;
            }
        }));
        // Check activated query params
        this.route.queryParamMap.subscribe(params => {
            if (params) {
                this.coachFilters = Object.assign(Object.assign({}, params.keys), params);
                this.courseFilters = Object.assign(Object.assign({}, params.keys), params);
                this.fetchCoaches();
                this.fetchCourses();
            }
        });
    }
    fetchCoaches() {
        // Fetch appropriate data, checking state to avoid duplicate calls
        const COACH_RESULTS_KEY = makeStateKey('results'); // create a key for saving/retrieving a state
        const coachStateData = this.transferState.get(COACH_RESULTS_KEY, null); // checking if data in the storage exists
        if (coachStateData == null) { // if data state does not exist - retrieve it from the api
            this.getCoachSearchResults()
                .then((results) => {
                if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                    this.transferState.set(COACH_RESULTS_KEY, results);
                }
            });
        }
        else { // if data state exists retrieve it from the state storage
            this.coachHits = coachStateData;
            this.transferState.remove(COACH_RESULTS_KEY);
        }
    }
    fetchCourses() {
        const COURSE_RESULTS_KEY = makeStateKey('course-results'); // create a key for saving/retrieving a state
        const courseStateData = this.transferState.get(COURSE_RESULTS_KEY, null); // checking if data in the storage exists
        if (courseStateData == null) { // if data state does not exist - retrieve it from the api
            this.getCourseSearchResults()
                .then((results) => {
                if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                    this.transferState.set(COURSE_RESULTS_KEY, results);
                }
            });
        }
        else { // if data state exists retrieve it from the state storage
            this.courseHits = courseStateData;
            this.transferState.remove(COURSE_RESULTS_KEY);
        }
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
    receiveCoachPageUpdate(event) {
        // Page has been changed by the navigator component
        // console.log('Browse component received new page request:', event);
        this.coachPage = event;
        this.fetchCoaches();
    }
    receiveCoursePageUpdate(event) {
        // Page has been changed by the navigator component
        // console.log('Browse component received new page request:', event);
        this.coursePage = event;
        this.fetchCourses();
    }
    getCoachSearchResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCoaches(this.coachHitsPerPage, this.coachPage, this.coachFilters);
            this.totalCoachHits = res.nbHits;
            this.coachHits = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    getCourseSearchResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCourses(this.courseHitsPerPage, this.coursePage, this.courseFilters);
            this.totalCourseHits = res.nbHits;
            this.courseHits = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('home-search-results-page');
    }
};
HomeSearchResultsComponent = __decorate([
    Component({
        selector: 'app-home-search-results',
        templateUrl: 'home-search-results.component.html',
        styleUrls: ['./home-search-results.component.scss']
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
], HomeSearchResultsComponent);
export { HomeSearchResultsComponent };
//# sourceMappingURL=home-search-results.component.js.map