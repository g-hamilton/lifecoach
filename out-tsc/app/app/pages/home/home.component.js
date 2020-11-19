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
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';
let HomeComponent = class HomeComponent {
    constructor(platformId, analyticsService, titleService, metaTagService, transferState, searchService, dataService) {
        this.platformId = platformId;
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.transferState = transferState;
        this.searchService = searchService;
        this.dataService = dataService;
        this.wordIndex = 0;
        this.words = ['Life', 'Academic', 'Business', 'Career', 'Family', 'Financial', 'Fitness', 'Health', 'Holistic', 'Management', 'Mindset', 'Parenting', 'Productivity', 'Relationship', 'Relocation', 'Retirement', 'Spiritual', 'Sports', 'Transformation', 'Wellness'];
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        this.titleService.setTitle('Lifecoach | Connect With Professional Coaches');
        this.metaTagService.updateTag({ name: 'description', content: 'Find professional coaches for every area of life with Lifecoach.io' });
        // Register a page view if we're in the browser (not SSR)
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
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
        // Fetch newest coaches data, checking state to avoid duplicate calls
        const STATE_KEY_COACHES = makeStateKey('newest_coaches'); // create a key for saving/retrieving a state
        const StateDataCoaches = this.transferState.get(STATE_KEY_COACHES, null); // checking if data in the storage exists
        if (StateDataCoaches == null) { // if data state does not exist - retrieve it from the api
            this.getNewestCoaches()
                .then((results) => {
                if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                    this.transferState.set(STATE_KEY_COACHES, results);
                }
            });
        }
        else { // if data state exists retrieve it from the state storage
            this.newestCoaches = StateDataCoaches;
            this.transferState.remove(STATE_KEY_COACHES);
        }
        // Fetch newest courses data, checking state to avoid duplicate calls
        const STATE_KEY_COURSES = makeStateKey('newest_courses'); // create a key for saving/retrieving a state
        const StateDataCourses = this.transferState.get(STATE_KEY_COURSES, null); // checking if data in the storage exists
        if (StateDataCourses == null) { // if data state does not exist - retrieve it from the api
            this.getNewestCourses()
                .then((results) => {
                if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                    this.transferState.set(STATE_KEY_COURSES, results);
                }
            });
        }
        else { // if data state exists retrieve it from the state storage
            this.newestCourses = StateDataCourses;
            this.transferState.remove(STATE_KEY_COURSES);
        }
    }
    ngAfterViewInit() {
        if (this.browser) {
            this.timer = setInterval(() => {
                const tempIndex = this.wordIndex + 1;
                if (this.words[tempIndex] != null) {
                    return this.wordIndex++;
                }
                else {
                    return this.wordIndex = 0;
                }
            }, 2000);
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
    getNewestCoaches() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCoaches(6, 0);
            this.newestCoaches = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    getNewestCourses() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.searchService.searchCourses(8, 0, {}, this.includeTestData);
            this.newestCourses = res.hits; // so we can update the view
            return res.hits; // so we can save the state
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        if (this.timer != null) {
            clearInterval(this.timer);
        }
    }
};
HomeComponent = __decorate([
    Component({
        selector: 'app-home',
        templateUrl: './home.component.html',
        styleUrls: ['./home.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AnalyticsService,
        Title,
        Meta,
        TransferState,
        SearchService,
        DataService])
], HomeComponent);
export { HomeComponent };
//# sourceMappingURL=home.component.js.map