import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';

import { AlgoliaCoachProfile } from '../../interfaces/algolia.coach.profile';
import { AlgoliaPublishedCourse } from 'app/interfaces/algolia.published.course';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-search-results',
  templateUrl: 'home-search-results.component.html',
  styleUrls: ['./home-search-results.component.scss']
})
export class HomeSearchResultsComponent implements OnInit, OnDestroy {

  public coachFilters: any;
  public coachHitsPerPage = 3;
  public coachPage = 1;
  public coachHits: AlgoliaCoachProfile[];
  public totalCoachHits: number;

  public maxSize = 10;

  public courseFilters: any;
  public courseHitsPerPage = 4;
  public coursePage = 1;
  public courseHits: AlgoliaPublishedCourse[];
  public totalCourseHits: number;

  public clientCurrency: string;
  public clientCountry: string;
  public rates: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private route: ActivatedRoute,
    private router: Router,
    private transferState: TransferState,
    private searchService: SearchService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    this.titleService.setTitle('Search Results');
    this.metaTagService.updateTag({name: 'description', content: 'Coaches & Self-Study Coaching Courses'});
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
      } else {
        this.getClientCurrencyAndCountryFromIP();
      }
    }

    // Monitor platform rates for realtime price calculations
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          // console.log('Rates:', rates);
          this.rates = rates;
        }
      })
    );

    // Check activated query params
    this.route.queryParamMap.subscribe(params => {
      if (params) {
        this.coachFilters = {...params.keys, ...params};
        this.courseFilters = {...params.keys, ...params};

        this.fetchCoaches();
        this.fetchCourses();
      }
    });

  }

  fetchCoaches() {
    // Fetch appropriate data, checking state to avoid duplicate calls
    const COACH_RESULTS_KEY = makeStateKey<any>('results'); // create a key for saving/retrieving a state
    const coachStateData = this.transferState.get(COACH_RESULTS_KEY, null as any); // checking if data in the storage exists
    if (coachStateData == null) { // if data state does not exist - retrieve it from the api
      this.getCoachSearchResults()
        .then((results) => {
          if (isPlatformServer(this.platformId)) { // store the state if we're on the server
            this.transferState.set(COACH_RESULTS_KEY, results as any);
          }
        });
    } else { // if data state exists retrieve it from the state storage
      this.coachHits = coachStateData;
      this.transferState.remove(COACH_RESULTS_KEY);
    }
  }

  fetchCourses() {
    const COURSE_RESULTS_KEY = makeStateKey<any>('course-results'); // create a key for saving/retrieving a state
    const courseStateData = this.transferState.get(COURSE_RESULTS_KEY, null as any); // checking if data in the storage exists
    if (courseStateData == null) { // if data state does not exist - retrieve it from the api
      this.getCourseSearchResults()
        .then((results) => {
          if (isPlatformServer(this.platformId)) { // store the state if we're on the server
            this.transferState.set(COURSE_RESULTS_KEY, results as any);
          }
        });
    } else { // if data state exists retrieve it from the state storage
      this.courseHits = courseStateData;
      this.transferState.remove(COURSE_RESULTS_KEY);
    }
  }

  async getClientCurrencyAndCountryFromIP() {
    const res = await fetch('https://ipapi.co/json/');
    // console.log(res.status);
    if (res.status === 200) {
      const json = await res.json();
      if (json.currency) {
        this.clientCurrency = json.currency;
        localStorage.setItem('client-currency', String(json.currency));
      }
      if (json.country) {
        this.clientCountry = json.country;
        localStorage.setItem('client-country', String(json.country));
      }
    }
  }

  receiveCoachPageUpdate(event: number) {
    // Page has been changed by the navigator component
    // console.log('Browse component received new page request:', event);
    this.coachPage = event;
    this.fetchCoaches();
  }

  receiveCoursePageUpdate(event: number) {
    // Page has been changed by the navigator component
    // console.log('Browse component received new page request:', event);
    this.coursePage = event;
    this.fetchCourses();
  }

  async getCoachSearchResults() {
    const res = await this.searchService.searchCoaches(this.coachHitsPerPage, this.coachPage, this.coachFilters);
    this.totalCoachHits = res.nbHits;
    this.coachHits = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  async getCourseSearchResults() {
    const res = await this.searchService.searchCourses(this.courseHitsPerPage, this.coursePage, this.courseFilters);
    this.totalCourseHits = res.nbHits;
    this.courseHits = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('home-search-results-page');
  }

}
