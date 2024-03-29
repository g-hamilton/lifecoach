import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from 'app/services/search.service';

import { AlgoliaCoachProfile } from '../../interfaces/algolia.coach.profile';
import { AlgoliaPublishedCourse } from 'app/interfaces/algolia.published.course';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

import { VgAPI } from 'videogular2/compiled/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CheckCoachNameModalComponent } from 'app/components/check-coach-name-modal/check-coach-name-modal.component';
import { SearchCoachesRequest } from 'app/interfaces/search.coaches.request.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public browser: boolean;

  public newestCoaches: AlgoliaCoachProfile[];
  public newestCourses: AlgoliaPublishedCourse[];
  public searchTerm: string;

  public clientCurrency: string;
  public clientCountry: string;
  public rates: any;

  private subscriptions: Subscription = new Subscription();

  public goals = ['Becoming a Better Leader', 'Growing Your Influence', 'Building Confidence', 'Developing Self-Awareness',
  'Recovering from Injury', 'Creating Better Habits', 'Achieving Your Goals', 'Better Time-Management', 'Finding Your Purpose', 'Increasing Your Energy',
  'Teamwork', 'Determination', 'Managing Finances', 'Deeper Sleep', 'Forgiveness',
  'Healing From Trauma', 'Long-Term Planning', 'Overcoming Fear & Anxiety', 'Finding Clarity', 'Defining Your Vision',
  'Moving Past Pain', 'Focus', 'Building Resilience to Stress', 'Authenticity', 'Improved Flexibility', 'Self-Acceptance', 'Love',
  'Stronger Relationships', 'Renewing Your Passion', 'Inspiring Others', 'Emotional Intelligence', 'Positive Thinking',
  'Better Ageing', 'Deeper Meditation', 'Athletic Performance', 'Healthier Immune System', 'Achieving More',
  'Emotional Balance', 'Getting Fit', 'Improving Your Posture', 'Resistance to Overwhelm', 'Finding Inner Peace'];

  public tagsToHighlight = [0, 2, 5, 8, 11, 17, 18, 25, 30, 36, 37];

  private vgApi: VgAPI; // http://www.videogular.com/tutorials/videogular-api/

  public bsModalRef: BsModalRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private transferState: TransferState,
    private searchService: SearchService,
    private dataService: DataService,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    this.titleService.setTitle('Lifecoach | The Premier Personal Coaching & Transformation Platform');
    this.metaTagService.updateTag({name: 'description', content: `Get coached online by the world's best personal development & transformation coaches. Find your coach today!`});
    this.metaTagService.updateTag({property: 'og:title', content: 'Lifecoach | The Premier Personal Coaching & Transformation Platform'});
    this.metaTagService.updateTag({property: 'og:description', content: `Get coached online by the world's best personal development & transformation coaches. Find your coach today!`});
    this.metaTagService.updateTag({property: 'og:type', content: 'website'});
    this.metaTagService.updateTag({property: 'og:site_name', content: 'lifecoach.io'});
    this.metaTagService.updateTag({property: 'og:image:url', content: 'https://lifecoach.io/assets/img/homepage/lifecoach-online-coaching-programs-coaches-courses.jpg'});
    this.metaTagService.updateTag({property: 'og:image:width', content: '1063px'});
    this.metaTagService.updateTag({property: 'og:image:height', content: '496px'});
    this.metaTagService.updateTag({property: 'og:video', content: 'https://firebasestorage.googleapis.com/v0/b/lifecoach-6ab28.appspot.com/o/platform%2FLifecoach%20Hero%20Web%20Optimized.mp4_1611826950?alt=media&token=d3f48f25-4fa3-4dfc-bef8-c5d0bfc1b4d8'});

    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();
      // this.checkSavedClientCurrencyAndCountry();
    }

    // this.monitorPlatformRates();
    this.fetchNewestCoaches();
    // this.fetchNewestCourses();

  }

  onPlayerReady(api: VgAPI) {
    // fires when the videoGular player is ready
    // console.log('onPlayerReady');

    this.vgApi = api;

    // listen for the data loaded event

    this.vgApi.getDefaultMedia().subscriptions.loadedData.subscribe($event => {
      // console.log('Video loaded data', $event);
    });

    this.vgApi.getDefaultMedia().subscriptions.canPlay.subscribe($event => {
      // console.log('Video can play', $event);
      this.vgApi.play();
    });

    // listen for the video ended event
    this.vgApi.getDefaultMedia().subscriptions.ended.subscribe($event => {
      // console.log('Video ended:', $event);
    });
    // end video ended event listener
  }

  checkSavedClientCurrencyAndCountry() {
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

  monitorPlatformRates() {
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

  fetchNewestCoaches() {
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
  }

  fetchNewestCourses() {
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
    const request: SearchCoachesRequest = {
      page: 0,
      hitsPerPage: 6
    };
    const res = await this.searchService.searchCoaches(request);
    this.newestCoaches = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  async getNewestCourses() {
    const res = await this.searchService.searchCourses(8, 0, {});
    this.newestCourses = res.hits; // so we can update the view
    return res.hits; // so we can save the state
  }

  onGoPrograms() {
    this.analyticsService.clickBrowsePrograms();
  }

  onGoCourses() {
    this.analyticsService.clickBrowseCourses();
  }

  onGoCoaches() {
    this.analyticsService.clickBrowseCoaches();
  }

  onFindCoach() {
    // pop the check coach name modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      class: 'modal-lg', // let's make this a large one!
      initialState: {
        message: `Do you know the coach's name?`
      } as any
    };
    this.bsModalRef = this.modalService.show(CheckCoachNameModalComponent, config);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
