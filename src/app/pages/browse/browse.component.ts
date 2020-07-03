import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';

import { AlgoliaCoachProfile } from '../../interfaces/algolia.coach.profile';

@Component({
  selector: 'app-browse',
  templateUrl: 'browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, OnDestroy {

  public filters: any;
  public hitsPerPage = 6;
  public page = 1;
  public maxSize = 10;
  public hits: AlgoliaCoachProfile[];
  public totalHits: number;

  public coachCountries: any;
  public coachCities: any;

  constructor(
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private route: ActivatedRoute,
    private router: Router,
    private transferState: TransferState,
    private searchService: SearchService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    console.log('Browse component init');
    this.titleService.setTitle('Find a Life Coach');
    this.metaTagService.updateTag({name: 'description', content: 'Top rated life coaches in your area'});
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('browse-page');

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }

    // Check activated query params
    this.route.queryParamMap.subscribe(params => {
      if (params) {
        this.filters = {...params.keys, ...params};
        // console.log(this.filters);

        if (this.filters.page) {
          this.page = this.filters.page;
        }

        // Update meta data
        this.updateMeta();

        // Update active page
        this.updateActivePage();

        // Fetch appropriate data, checking state to avoid duplicate calls
        const STATE_KEY = makeStateKey<any>('profile'); // create a key for saving/retrieving a state
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
    // If only category is defined
    if (this.filters.params.category && !this.filters.params.country) {
      this.titleService.setTitle(`Find A ${cat} Coach`);
      this.metaTagService.updateTag({name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in your area`});
    }
    // If both category and country are defined but not city
    if (this.filters.params.category && this.filters.params.country && !this.filters.params.city) {
      this.titleService.setTitle(`Find A ${cat} Coach in ${this.filters.params.country}`);
      this.metaTagService.updateTag({name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in ${this.filters.params.country}`});
    }
    // If category, country and city are defined
    if (this.filters.params.category && this.filters.params.country && this.filters.params.city) {
      this.titleService.setTitle(`Find A ${cat} Coach in ${this.filters.params.city}, ${this.filters.params.country}`);
      this.metaTagService.updateTag({name: 'description', content: `Top rated ${cat.toLowerCase()} coaches in ${this.filters.params.city}, ${this.filters.params.country}`});
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
    console.log('Browse component received new page request:', event);
    const newParams = Object.assign({}, this.filters.params);
    newParams.page = event;
    this.router.navigate(['/coaches'], {queryParams: newParams});
  }

  onCountriesUpdated(event: any) {
    this.coachCountries = event;
  }

  onCitiesUpdated(event: any) {
    this.coachCities = event;
  }

  async getSearchResults() {
    const res = await this.searchService.searchCoaches(this.hitsPerPage, this.page, this.filters);
    this.totalHits = res.nbHits;
    this.hits = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  ngOnDestroy() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('browse-page');
  }

}
