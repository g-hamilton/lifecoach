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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
let CoachComponent = class CoachComponent {
    constructor(document, platformId, route, dataService, analyticsService, titleService, metaTagService, transferState, authService) {
        this.document = document;
        this.platformId = platformId;
        this.route = route;
        this.dataService = dataService;
        this.analyticsService = analyticsService;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.transferState = transferState;
        this.authService = authService;
        this.subscriptions = new Subscription();
        this.showModal = false;
        this.dayToSelect = [];
        this.timeToSelect = [];
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
            const PROFILE_KEY = makeStateKey('profile'); // create a key for saving/retrieving profile state
            const profileData = this.transferState.get(PROFILE_KEY, null); // checking if profile data in the storage exists
            if (profileData === null) { // if profile state data does not exist - retrieve it from the api
                this.subscriptions.add(this.dataService.getPublicCoachProfile(this.coachId).subscribe(publicProfile => {
                    if (publicProfile) { // The profile is public
                        this.initProfile(publicProfile);
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(PROFILE_KEY, publicProfile);
                        }
                        // The profile is not yet public so fallback to allow user to still preview their own profile.
                        // Not needed for SSR as this data is private.
                    }
                    else if (isPlatformBrowser(this.platformId)) {
                        this.subscriptions.add(this.dataService.getCoachProfile(this.coachId).subscribe(profile => {
                            if (profile) {
                                this.initProfile(profile);
                            }
                        }));
                    }
                }));
            }
            else { // if profile state data exists retrieve it from the state storage
                this.initProfile(profileData);
                this.transferState.remove(PROFILE_KEY);
            }
            // Fetch the activated user's courses
            const COURSES_KEY = makeStateKey('courses'); // create a key for saving/retrieving courses state
            const coursesData = this.transferState.get(COURSES_KEY, null); // checking if course data in the storage exists
            if (coursesData === null) { // if courses state data does not exist - retrieve it from the api
                this.subscriptions.add(this.dataService.getPublicCoursesBySeller(this.coachId).subscribe(publicCourses => {
                    if (publicCourses) { // The coach has at least one public course
                        this.courses = publicCourses;
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(COURSES_KEY, publicCourses);
                        }
                    }
                }));
            }
            else { // if courses state data exists retrieve it from the state storage
                this.courses = coursesData;
                this.transferState.remove(COURSES_KEY);
            }
            // Fetch the activated user's services
            const SERVICES_KEY = makeStateKey('services'); // create a key for saving/retrieving state
            const servicesData = this.transferState.get(SERVICES_KEY, null); // checking if data in the storage exists
            if (servicesData === null) { // if state data does not exist - retrieve it from the api
                this.subscriptions.add(this.dataService.getCoachServices(this.coachId).subscribe(services => {
                    if (services) { // The coach has at least one published service
                        this.publishedServices = services;
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(SERVICES_KEY, services);
                        }
                    }
                }));
            }
            else { // if state data exists retrieve it from the state storage
                this.publishedServices = servicesData;
                this.transferState.remove(SERVICES_KEY);
            }
        });
    }
    initProfile(profile) {
        if (profile) {
            this.userProfile = profile;
            console.log('this is user profile', profile);
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
            this.subscriptions.add(this.dataService.getUserNotReservedEvents(this.coachId).subscribe(next => {
                console.log(next);
                if (next) {
                    this.availableEvents = next;
                    this.availableEvents.forEach(i => {
                        console.log(i.start);
                        // @ts-ignore
                        const startDate = new Date(i.start.seconds * 1000);
                        console.log('Start Date = ', startDate);
                        const day = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
                        console.log('Day', day);
                        if (!this.dayToSelect.some((date) => this.isSameDay(date, day))) {
                            this.dayToSelect.push(day);
                        }
                    });
                }
                else {
                    this.availableEvents = [];
                }
                console.log('UNIQUE DAYS:', this.dayToSelect);
            }));
            this.authService.getAuthUser().pipe(first()).subscribe(value => this.userId = value.uid);
        }
    }
    daySelect(event) {
        console.log(event.target.value);
        const selectedDate = new Date(event.target.value);
        selectedDate.setDate(selectedDate.getDate() + 1);
        // @ts-ignore
        this.todayEvents = this.availableEvents.filter(i => this.isSameDay(new Date(i.start.seconds * 1000), selectedDate));
    }
    isSameDay(a, b) {
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
            const map = new google.maps.Map(this.document.getElementById('coachCityMap'), mapOptions);
            // Init default marker
            let marker = new google.maps.Marker({
                position: defaultLatlng
            });
            // Attempt to geocode coach's city and update default map center & marker
            geocoder.geocode({
                address: this.userProfile.city + ', ' + this.userProfile.country.name
            }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    marker = new google.maps.Marker({
                        map,
                        position: results[0].geometry.location
                    });
                }
                else {
                    console.log('Geocode unsuccessful');
                }
            });
            // Load marker
            marker.setMap(map);
        }
    }
    uploadOrder(id) {
        this.dataService.uploadOrder(this.userId, this.coachId, id);
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        const body = this.document.getElementsByTagName('body')[0];
        body.classList.remove('coach-page');
    }
    showSessions($event) {
        if (!this.userId) {
            alert('You should Sign in or Sign Up to do that');
            return;
        }
        this.showModal = true;
        console.log('Free events', this.availableEvents);
    }
    reserveSession($event) {
        console.log($event.target.value);
        this.uploadOrder($event.target.value);
    }
    hideModal() {
        this.showModal = false;
    }
};
CoachComponent = __decorate([
    Component({
        selector: 'app-coach',
        templateUrl: 'coach.component.html',
        styleUrls: ['./coach.component.scss']
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, ActivatedRoute,
        DataService,
        AnalyticsService,
        Title,
        Meta,
        TransferState,
        AuthService])
], CoachComponent);
export { CoachComponent };
//# sourceMappingURL=coach.component.js.map