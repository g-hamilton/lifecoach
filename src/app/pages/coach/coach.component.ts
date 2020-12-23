import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

declare var google: any; // Silence Typescript 'google' warning

import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';

import { CoachProfile } from '../../interfaces/coach.profile.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { Subscription } from 'rxjs';
import { CustomCalendarEvent } from '../../interfaces/custom.calendar.event.interface';
import { AuthService } from '../../services/auth.service';
import { first, take } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { AlertService } from 'app/services/alert.service';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ScheduleCallComponent } from 'app/components/schedule-call/schedule-call.component';


@Component({
  selector: 'app-coach',
  templateUrl: 'coach.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./coach.component.scss']
})
export class CoachComponent implements OnInit, OnDestroy {

  @ViewChild('loginModal', {static: false}) public loginModal: ModalDirective;
  @ViewChild('registerModal', {static: false}) public registerModal: ModalDirective;

  public bsModalRef: BsModalRef;

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

  public loginForm: FormGroup;
  public login = false;
  public lfocusTouched = false;
  public lfocusTouched1 = false;
  public loginAttempt: boolean;

  public userType: string;
  public registerForm: FormGroup;
  public register = false;
  public rfocusTouched = false;
  public rfocusTouched1 = false;
  public rfocusTouched2 = false;
  public rfocusTouched3 = false;
  public registerAttempt: boolean;

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
    private toastrService: ToastrService,
    public formBuilder: FormBuilder,
    private alertService: AlertService,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    const body = this.document.getElementsByTagName('body')[0];
    body.classList.add('coach-page');
    console.log(PLATFORM_ID);
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.userType = 'regular';
      this.analyticsService.pageView();
      this.buildRegisterForm();
      this.buildLoginForm();
      this.getUser();
    }

    // Check activated route params for user ID
    this.route.params.subscribe(params => {
      this.coachId = params.uid;
      console.log('Activated Coach ID:', this.coachId);
      if (!this.coachId) {
        return;
      }

      // we have a coach id. continue...
      this.getCoachProfile();
      this.getCoachCourses();
      this.getCoachPrograms();
      // this.getCoachServices();

    });
  }

  getUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
          }
        }, error => console.log('error logger', error.message))
    );
  }

  buildRegisterForm() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      }
    );
  }

  get registerF(): any {
    return this.registerForm.controls;
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }
    );
  }

  get loginF(): any {
    return this.loginForm.controls;
  }

  getCoachProfile() {
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
              }, error => console.log('error logger', error.message))
            );
          }
        }, error => console.log('error logger', error.message))
      );

      } else { // if profile state data exists retrieve it from the state storage
        this.initProfile(profileData);
        this.transferState.remove(PROFILE_KEY);
      }
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
    }
  }

  getCoachCourses() {
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
        }, error => console.log('error logger', error.message))
      );
    } else { // if courses state data exists retrieve it from the state storage
      this.courses = coursesData;
      this.transferState.remove(COURSES_KEY);
    }
  }

  getCoachPrograms() {
    const PROGRAMS_KEY = makeStateKey<any>('programs'); // create a key for saving/retrieving state

    const programsData = this.transferState.get(PROGRAMS_KEY, null as any); // checking if data in the storage exists

    if (programsData === null) { // if state data does not exist - retrieve it from the api
      this.subscriptions.add(
        this.dataService.getPublicProgramsBySeller(this.coachId).subscribe(programs => {
          if (programs) { // The coach has at least one published program
            this.publishedPrograms = programs;
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(PROGRAMS_KEY, programs);
            }
          }
        }, error => console.log('error logger', error.message))
      );

    } else { // if state data exists retrieve it from the state storage
      this.publishedPrograms = programsData;
      this.transferState.remove(PROGRAMS_KEY);
    }
  }

  getCoachServices() {
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
        }, error => console.log('error logger', error.message))
      );
    } else { // if state data exists retrieve it from the state storage
      this.publishedServices = servicesData;
      this.transferState.remove(SERVICES_KEY);
    }
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

  openScheduleCallModal() {
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        coachId: this.coachId
      }
    };
    this.bsModalRef = this.modalService.show(ScheduleCallComponent, config);
  }

  async forgotPassword() {
    const res = await this.alertService.alert('input-field', 'Forgot your password?',
      'No problem! Simply request a password reset email...') as any;
    if (res.complete && res.data) {
      const email = (res.data as string).toLowerCase().trim();
      const response = await this.authService.resetPassword(email) as any;
      // console.log(response);
      if (response.result !== 'error') {
        this.alertService.alert('success-message', 'Success!', `Your password reset email is on the way. Please check your inbox.`);
      } else {
        // console.log(response.msg);
        if (response.msg === 'auth/user-not-found') {
          this.alertService.alert('warning-message', 'Oops!', 'That email address has not been found. Please check it and try again.');
        } else {
          this.alertService.alert('warning-message', 'Oops!', 'Something went wrong. Please contact hello@lifecoach.io for help.');
        }
      }
    }
  }

  async onRegister() {
    this.registerAttempt = true;
    // Check we have captured a user type
    // console.log('User type to register:', this.userType);
    if (!this.userType) {
      alert('Invalid user type');
      return;
    }
    // Check form validity
    if (this.registerForm.valid) {
      this.register = true;
      // Create new account object
      const newUserAccount: UserAccount = {
        accountEmail: this.registerF.email.value,
        password: this.registerF.password.value,
        accountType: this.userType as any,
        firstName: this.registerF.firstName.value,
        lastName: this.registerF.lastName.value
      };
      const firstName = this.registerF.firstName.value;
      // Check account type & attempt registration
      const response = await this.authService.createUserWithEmailAndPassword(newUserAccount);
      if (!response.error) {
        // Success
        this.register = false;
        console.log('Registration successful:', response.result.user);
        this.userId = response.result.user.uid;
        this.analyticsService.registerUser(response.result.user.uid, 'email&password', newUserAccount);
        this.registerModal.hide();
        this.alertService.alert('success-message', 'Success!', `Welcome to Lifecoach ${firstName}. You can now schedule a call with this Coach.`);
      } else {
        // Error
        this.register = false;
        if (response.error.code === 'auth/email-already-in-use') {
          this.alertService.alert('warning-message', 'Oops', 'That email is already registered. Please log in.');
        } else if (response.error.code === 'auth/invalid-email') {
          this.alertService.alert('warning-message', 'Oops', 'Invalid email address. Please try a different email.');
        } else if (response.error.code === 'auth/weak-password') {
          this.alertService.alert('warning-message', 'Oops', 'Password is too weak. Please use a stronger password.');
        } else {
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please contact hello@lifecoach.io for help');
        }
      }
      this.registerAttempt = false;
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
    }
  }

  async onLogin() {
    this.loginAttempt = true;
    // Log the user in
    if (this.loginForm.valid) {
      this.login = true;
      const account: UserAccount = {
        accountEmail: this.loginF.email.value,
        password: this.loginF.password.value,
        accountType: null
      };
      const res = await this.authService.signInWithEmailAndPassword(account);
      if (!res.error) {
        // Login successful.
        this.userId = res.result.user.uid;
        this.loginModal.hide();
        this.alertService.alert('success-message', 'Login Successful', `You can now schedule a call with this Coach.`);
        this.analyticsService.signIn(res.result.user.uid, 'email&password', account.accountEmail);
      } else {
        // Login error.
        this.login = false;
        // Check auth provider error codes.
        if (res.error.code === 'auth/wrong-password') {
          this.alertService.alert('warning-message', 'Oops', 'Incorrect password. Please try again.');
        } else if (res.error.code === 'auth/user-not-found') {
          this.alertService.alert('warning-message', 'Oops', 'Email address not found. Please check your login email address is correct.');
        } else {
          // Fall back for unknown / no error code
          this.alertService.alert('warning-message', 'Oops', 'Something went wrong. Please try again or contact hello@lifecoach.io for assistance.');
        }
      }
      this.loginAttempt = false;
    } else {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields.');
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    const body = this.document.getElementsByTagName('body')[0];
    body.classList.remove('coach-page');
  }

}
