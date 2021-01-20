import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-courses',
  templateUrl: 'courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit, OnDestroy {

  public filters: any;
  public hitsPerPage = 8;
  public page = 1;
  public maxSize = 10;
  public hits: any[]; // TODO make type Algolia Course
  public totalHits: number;

  public clientCurrency: string;
  public clientCountry: string;
  public rates: any;

  public categories = [
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
    this.titleService.setTitle('Online Coaching Courses');
    this.metaTagService.updateTag({name: 'description', content: 'Get coached by the best with top rated online coaching courses from Lifecoach.io'});
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
      } else {
        this.getClientCurrencyAndCountryFromIP();
      }
    }

    // Check activated query params
    this.route.queryParamMap.subscribe(params => {
      if (params) {
        this.filters = {...params.keys, ...params};

        if (this.filters.page) {
          this.page = this.filters.page;
        }

        // Update meta data
        this.updateMeta();

        // Update active page
        this.updateActivePage();

        // Fetch appropriate data, checking state to avoid duplicate calls
        const STATE_KEY = makeStateKey<any>('courses'); // create a key for saving/retrieving a state
        const StateData = this.transferState.get(STATE_KEY, null as any); // checking if data in the storage exists
        if (StateData == null) { // if data state does not exist - retrieve it from the api
          this.getSearchResults()
            .then((results) => {
              if (isPlatformServer(this.platformId)) { // store the state if we're on the server
                this.transferState.set(STATE_KEY, results as any);
              }
            });
        } else { // if data state exists retrieve it from the state storage
          this.hits = StateData;
          this.transferState.remove(STATE_KEY);
        }
      }
    });

    // Monitor platform rates for realtime price calculations
    this.subscriptions.add(
      this.dataService.getPlatformRates().subscribe(rates => {
        if (rates) {
          // console.log('Rates:', rates);
          this.rates = rates;
        }
      })
    );
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

  onManualCurrencyChange(ev: string) {
    console.log('User changed currency to:', ev);
    this.clientCurrency = ev;
  }

  updateMeta() {
    let cat: string = this.filters.params.category;
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
      this.metaTagService.updateTag({name: 'description', content: `Top rated online coaching courses on ${cat.toLowerCase()}`});
    }
  }

  updateActivePage() {
    const p = this.filters.params.page;
    if (p) {
      this.page = Number(p);
    }
  }

  receivePageUpdate(event: number) {
    // Page has been changed by the navigator component
    console.log('Courses component received new page request:', event);
    const newParams = Object.assign({}, this.filters.params);
    newParams.page = event;
    this.router.navigate(['/courses'], {queryParams: newParams});
  }

  async getSearchResults() {
    const res = await this.searchService.searchCourses(this.hitsPerPage, this.page, this.filters);
    // console.log('Search results:', res);
    this.totalHits = res.nbHits;
    this.hits = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('courses-page');
  }

}
