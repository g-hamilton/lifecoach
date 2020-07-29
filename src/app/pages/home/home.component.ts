import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';

import { AlgoliaCoachProfile } from '../../interfaces/algolia.coach.profile';
import { AlgoliaPublishedCourse } from 'app/interfaces/algolia.published.course';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  public browser: boolean;

  public newestCoaches: AlgoliaCoachProfile[];
  public newestCourses: AlgoliaPublishedCourse[];
  public searchTerm: string;

  public includeTestData: boolean;

  public clientCurrency: string;
  public clientCountry: string;
  public rates: any;
  public timer: any;
  public wordIndex = 0;
  public words = ['Life', 'Academic', 'Business', 'Career', 'Family', 'Financial', 'Fitness', 'Health', 'Holistic', 'Management', 'Mindset', 'Parenting', 'Productivity', 'Relationship', 'Relocation', 'Retirement', 'Spiritual', 'Sports', 'Transformation', 'Wellness'];

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private transferState: TransferState,
    private searchService: SearchService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    this.titleService.setTitle('Lifecoach | Connect With Professional Coaches');
    this.metaTagService.updateTag({name: 'description', content: 'Find professional coaches for every area of life with Lifecoach.io'});

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

    // Fetch newest coaches data, checking state to avoid duplicate calls
    const STATE_KEY_COACHES = makeStateKey<any>('newest_coaches'); // create a key for saving/retrieving a state
    const StateDataCoaches = this.transferState.get(STATE_KEY_COACHES, null as any); // checking if data in the storage exists
    if (StateDataCoaches == null) { // if data state does not exist - retrieve it from the api
      this.getNewestCoaches()
        .then((results) => {
          if (isPlatformServer(this.platformId)) { // store the state if we're on the server
            this.transferState.set(STATE_KEY_COACHES, results as any);
          }
        });
    } else { // if data state exists retrieve it from the state storage
      this.newestCoaches = StateDataCoaches;
      this.transferState.remove(STATE_KEY_COACHES);
    }

    // Fetch newest courses data, checking state to avoid duplicate calls
    const STATE_KEY_COURSES = makeStateKey<any>('newest_courses'); // create a key for saving/retrieving a state
    const StateDataCourses = this.transferState.get(STATE_KEY_COURSES, null as any); // checking if data in the storage exists
    if (StateDataCourses == null) { // if data state does not exist - retrieve it from the api
      this.getNewestCourses()
        .then((results) => {
          if (isPlatformServer(this.platformId)) { // store the state if we're on the server
            this.transferState.set(STATE_KEY_COURSES, results as any);
          }
        });
    } else { // if data state exists retrieve it from the state storage
      this.newestCourses = StateDataCourses;
      this.transferState.remove(STATE_KEY_COURSES);
    }

  }

  ngAfterViewInit(): void {
    if (this.browser) {
      this.timer = setInterval(() => {
        const tempIndex = this.wordIndex + 1;
        if (this.words[tempIndex] != null) {
          return this.wordIndex++;
        } else {
          return this.wordIndex = 0;
        }
      }, 2000);
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

  async getNewestCoaches() {
    const res = await this.searchService.searchCoaches(6, 0);
    this.newestCoaches = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  async getNewestCourses() {
    const res = await this.searchService.searchCourses(8, 0, {}, this.includeTestData);
    this.newestCourses = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }
}
