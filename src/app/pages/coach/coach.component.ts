import {Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

declare var google: any; // Silence Typescript 'google' warning

import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';

import { CoachProfile } from '../../interfaces/coach.profile.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { Subscription } from 'rxjs';
import {CustomCalendarEvent} from '../../interfaces/custom.calendar.event.interface';
import {AuthService} from '../../services/auth.service';
import {first, take} from 'rxjs/operators';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';


@Component({
  selector: 'app-coach',
  templateUrl: 'coach.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./coach.component.scss']
})
export class CoachComponent implements OnInit, OnDestroy {

  public browser: boolean;
  public coachId: string;
  public userProfile: CoachProfile;
  public courses: CoachingCourse[];
  public publishedServices: CoachingService[];
  public publishedPrograms: CoachingProgram[];
  public availableEvents: CustomCalendarEvent[] | [];
  public todayEvents: Array<any>;
  private subscriptions: Subscription = new Subscription();
  public userId: string;

  public showModal = false;
  public dayToSelect: Array<Date> = [];
  public timeToSelect: Array<Date> = [];

  public testArr: [];
  public test$;
  public testData: any;
  private selectedDate: Date;

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private metaTagService: Meta,
    private transferState: TransferState,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {
  }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('coach-page');
    console.log(PLATFORM_ID);
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();
    }

    // Check activated route params for user ID
    this.route.params.subscribe(params => {
      this.coachId = params.uid;

      // Fetch the activated user's profile
      const PROFILE_KEY = makeStateKey<any>('profile'); // create a key for saving/retrieving profile state

      const profileData = this.transferState.get(PROFILE_KEY, null as any); // checking if profile data in the storage exists

      if (profileData === null) { // if profile state data does not exist - retrieve it from the api
        this.subscriptions.add(
          this.dataService.getPublicCoachProfile(this.coachId).subscribe(publicProfile => {
            if (publicProfile) { // The profile is public
              this.initProfile(publicProfile);
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(PROFILE_KEY, publicProfile as any);
              }

              // The profile is not yet public so fallback to allow user to still preview their own profile.
              // Not needed for SSR as this data is private.
            } else if (isPlatformBrowser(this.platformId)) {
              this.subscriptions.add(
                this.dataService.getCoachProfile(this.coachId).subscribe(profile => {
                  if (profile) {
                    this.initProfile(profile);
                  }
                })
              );
            }
          })
        );

      } else { // if profile state data exists retrieve it from the state storage
        this.initProfile(profileData);
        this.transferState.remove(PROFILE_KEY);
      }

      // Fetch the activated user's courses
      const COURSES_KEY = makeStateKey<any>('courses'); // create a key for saving/retrieving courses state

      const coursesData = this.transferState.get(COURSES_KEY, null as any); // checking if course data in the storage exists

      if (coursesData === null) { // if courses state data does not exist - retrieve it from the api
        this.subscriptions.add(
          this.dataService.getPublicCoursesBySeller(this.coachId).subscribe(publicCourses => {
            if (publicCourses) { // The coach has at least one public course
              this.courses = publicCourses;
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(COURSES_KEY, publicCourses);
              }
            }
          })
        );
      } else { // if courses state data exists retrieve it from the state storage
        this.courses = coursesData;
        this.transferState.remove(COURSES_KEY);
      }

      // Fetch the activated user's programs
      const PROGRAMS_KEY = makeStateKey<any>('programs'); // create a key for saving/retrieving state

      const programsData = this.transferState.get(PROGRAMS_KEY, null as any); // checking if data in the storage exists

      if (programsData === null) { // if state data does not exist - retrieve it from the api
        this.subscriptions.add(
          this.dataService.getPublicProgramsBySeller(this.userId).subscribe(programs => {
            if (programs) { // The coach has at least one published program
              this.publishedPrograms = programs;
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(PROGRAMS_KEY, programs);
              }
            }
          })
        );
      } else { // if state data exists retrieve it from the state storage
        this.publishedPrograms = programsData;
        this.transferState.remove(PROGRAMS_KEY);
      }

      // Fetch the activated user's services
      const SERVICES_KEY = makeStateKey<any>('services'); // create a key for saving/retrieving state

      const servicesData = this.transferState.get(SERVICES_KEY, null as any); // checking if data in the storage exists

      if (servicesData === null) { // if state data does not exist - retrieve it from the api
        this.subscriptions.add(
          this.dataService.getCoachServices(this.coachId).subscribe(services => {
            if (services) { // The coach has at least one published service
              this.publishedServices = services;
              if (isPlatformServer(this.platformId)) {
                this.transferState.set(SERVICES_KEY, services);
              }
            }
          })
        );
      } else { // if state data exists retrieve it from the state storage
        this.publishedServices = servicesData;
        this.transferState.remove(SERVICES_KEY);
      }

    });
  }

  initProfile(profile) {
    if (profile) {
      this.userProfile = profile;

      // Build dynamic meta tags
      this.titleService.setTitle(`${this.userProfile.firstName} ${this.userProfile.lastName} |
          ${this.userProfile.speciality1.itemName} Coach`);
      this.metaTagService.updateTag({
        name: 'description', content: `Meet ${this.userProfile.firstName}
          ${this.userProfile.lastName}, Professional ${this.userProfile.speciality1.itemName} Coach at
          Lifecoach.io`
      }, `name='description'`);
      this.metaTagService.updateTag({
        property: 'og:title', content: `${this.userProfile.firstName} ${this.userProfile.lastName}`
      }, `property='og:title'`);
      this.metaTagService.updateTag({
        property: 'og:description', content: `${this.userProfile.speciality1.itemName} Coach`
      }, `property='og:description'`);
      this.metaTagService.updateTag({
        property: 'og:image:url', content: this.userProfile.photo
      }, `property='og:image:url'`);

      // Build Google Map - center on coach city
      this.buildMap();

      // Record this coach view in analytics (not SSR)
      if (isPlatformBrowser(this.platformId)) {
        this.analyticsService.viewCoach(this.userProfile);
      }
      this.subscriptions.add(
        this.dataService.getUserNotReservedEvents(this.coachId).subscribe(next => {
          console.log(next);
          if (next) {
            this.availableEvents = next;
            console.log(next);
            this.dayToSelect = [];
            this.availableEvents.forEach( i => {
              // @ts-ignore
              const startDate = new Date(i.start.seconds * 1000);
              const day = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
              if (!this.dayToSelect.some( (date) => this.isSameDay(date, day))) {
                this.dayToSelect.push(day);
              }
            });
            }
          console.log('UNIQUE DAYS:', this.dayToSelect);
        })
      );
      this.authService.getAuthUser().pipe(first()).subscribe(value => this.userId = value.uid);
    }
  }

  daySelect(event: any) {
    if (event.target.value !== 'NULL') {
      console.log(event.target.value);
      this.subscriptions.add(
        this.dataService.getUserNotReservedEvents(this.coachId, new Date(event.target.value))
          .subscribe(next => {
          this.todayEvents = next;
        })
      );
    } else {
    }
  }
  isSameDay(a: Date, b: Date) {
    return (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate());
  }

  buildMap() {
    if (isPlatformBrowser(this.platformId)) {
      const geocoder = new google.maps.Geocoder();
      const defaultLatlng = new google.maps.LatLng(40.748817, -73.985428);
      const mapOptions = {
        zoom: 8,
        center: defaultLatlng,
        scrollwheel: false // Disable mouse scroll over the map, it is a really annoying!
      };

      // Load map
      const map = new google.maps.Map(
        this.document.getElementById('coachCityMap'),
        mapOptions
      );

      // Init default marker
      let marker = new google.maps.Marker({
        position: defaultLatlng
      });

      // Attempt to geocode coach's city and update default map center & marker
      geocoder.geocode({
        address: this.userProfile.city + ', ' + this.userProfile.country.name
      }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          marker = new google.maps.Marker({
            map,
            position: results[0].geometry.location
          });
        } else {
          console.log('Geocode unsuccessful');
        }
      });

      // Load marker
      marker.setMap(map);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('coach-page');
  }

  showSessions($event: any) {
    if (!this.userId) {
      alert('You should Sign in or Sign Up to do that');
      return;
    }
    this.showModal = true;
    console.log('Free events', this.availableEvents);
  }

  reserveSession($event: any) {
    this.dataService.reserveEvent(this.userId, this.coachId, $event.target.value).then( r => console.log('Reserved'));
    this.showNotification();
  }
  showNotification() {
    this.toastrService.success('<span data-notify="icon" class="tim-icons icon-bell-55"></span>You have 15 minutes for confirm Your reservation. Click here to redirect lifecoach.io/reserved.sessions',
      `You have successfully reserved event`,
      {
        timeOut: 8000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      }, )
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigate(['/reserved-sessions']));
  }

  hideModal() {
    this.showModal = false;
  }

}
