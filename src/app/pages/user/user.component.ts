import { Component, OnInit, Inject, PLATFORM_ID, AfterViewChecked, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { UrlScheme } from '../../custom-validators/urlscheme.validator';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CountryService } from '../../services/country.service';
import { CurrencyService } from '../../services/currency.service';
import { CoachingSpecialitiesService } from '../../services/coaching.specialities.service';
import { AnalyticsService } from '../../services/analytics.service';
import { StorageService } from '../../services/storage.service';
import { AlertService } from 'app/services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import {CloudFunctionsService} from '../../services/cloud-functions.service';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {

  public browser = false;

  public userId: string;

  public loadWizard: boolean;

  public fetchedProfile = false;
  public userProfile: FormGroup;
  public savingProfile = false;
  public saveAttempt = false;

  public focus: boolean;
  public focus1: boolean;
  public focus2: boolean;
  public focus3: boolean;
  public focus4: boolean;
  public focus5: boolean;
  public focus6: boolean;
  public focus7: boolean;
  public focus8: boolean;
  public focus9: boolean;
  public focus10: boolean;
  public focus11: boolean;
  public focus12: boolean;
  public focus13: boolean;

  public focusTouched: boolean;
  public focus1Touched: boolean;
  public focus2Touched: boolean;
  public focus3Touched: boolean;
  public focus4Touched: boolean;
  public focus5Touched: boolean;
  public focus6Touched: boolean;
  public focus7Touched: boolean;
  public focus8Touched: boolean;
  public focus9Touched: boolean;
  public focus10Touched: boolean;
  public focus11Touched: boolean;
  public focus12Touched: boolean;
  public focus13Touched: boolean;

  public countryList = this.countryService.getCountryList();
  public currencyList = this.currencyService.getCurrenciesAsArray();
  public specialityList = this.specialitiesService.getSpecialityList();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  public goalTagMinLength = 6;
  public goalTagMaxLength = 40;
  public goalTagsMax = 3;

  public credentialMinLength = 20;
  public credentialMaxLength = 120;
  public credentialsMax = 5;

  public summaryMinLength = 90;
  public summaryMaxLength = 120;
  public summaryActualLength = 0;

  public ErrorMessages = {
    firstName: {
      required: `Please enter your first name`
    },
    lastName: {
      required: `Please enter your last name`
    },
    city: {
      required: `Please enter your city`
    },
    gender: {
      required: `Please enter a gender or indicate that you prefer not to say`
    },
    proSummary: {
      required: `Please enter a short summary`,
      minlength: `This summary should be at least ${this.summaryMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.summaryMaxLength} characters.`
    },
    speciality1: {
      required: `Please select a closest matching field`
    },
    facebook: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    twitter: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    linkedin: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    youtube: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    instagram: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    website: {
      missingUrlScheme: `Address must include either 'http://' or 'https://`
    },
    goalTags: {
      required: `Please add at least one goal focussed outcome`,
      minlength: `Must be more than ${this.goalTagMinLength} characters`,
      maxlength: `Must be below ${this.goalTagMaxLength} characters`,
      includesComma: `Please only add one outcome per line`
    },
    credentials: {
      required: `Please add at least one credential`,
      minlength: `Must be more than ${this.credentialMinLength} characters`,
      maxlength: `Must be below ${this.credentialMaxLength} characters`,
      includesComma: `Please only add one credential area per line`
    }
  };

  public objKeys = Object.keys;

  public profileVideos: any;

  public shareForm: FormGroup;

  public shareProfile: any;

  public viewLoaded: boolean;

  public videoSources = [] as any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dataService: DataService,
    public formBuilder: FormBuilder,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private specialitiesService: CoachingSpecialitiesService,
    private analyticsService: AnalyticsService,
    private storageService: StorageService,
    private alertService: AlertService,
    private cloudFunctions: CloudFunctionsService
  ) {
  }

  ngOnInit() {
    this.buildProfileForm();
    this.buildShareForm();

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();
      this.monitorUserData();
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  monitorUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(async user => { // subscribe to the user
          if (user) {
            // As this component is shared by users and admins: if admin, check for route params for user ID,
            // otherwise get user ID from auth object
            const tokenResult = await user.getIdTokenResult();
            const claims = tokenResult.claims;

            if (claims && claims.admin) { // admin user on behalf of user
              console.log('User is an admin');
              this.route.params.subscribe(params => {
                if (params.uid) {
                  this.userId = params.uid;
                  this.monitorUserProfile();
                }
              });
            } else { // non-admin user editing own profile
              this.userId = user.uid;
              this.monitorUserProfile();
            }
          }
        })
    );
  }

  monitorUserProfile() {
    this.updateShareForm();
    this.subscriptions.add(
      this.dataService.getCoachProfile(this.userId)
        .subscribe(profile => { // subscribe to the profile
          if (profile && profile.dateCreated) {
            // console.log('Fetched user profile:', profile);
            this.loadUserProfileData(profile);
          } else { // if no profile exists, load the wizard
            this.loadWizard = true;
          }
        })
    );
    this.subscriptions.add(
      this.dataService.getProfileVideos(this.userId)
        .subscribe(videos => { // subscribe to the profile videos
          // console.log('Profile videos:', videos);
          if (videos && videos.length > 0) {
            const sortedByLastUploaded = videos.sort((a, b) => a.lastUploaded - b.lastUploaded);
            this.profileVideos = sortedByLastUploaded;
            // Set the last uploaded video as the active video
            this.videoSources = []; // reset
            this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
              src: this.profileVideos[this.profileVideos.length - 1].downloadURL
            });
            this.userProfile.patchValue({selectedProfileVideo: this.profileVideos[this.profileVideos.length - 1].downloadURL});
          } else {
            this.profileVideos = null;
          }
        })
    );
  }

  buildProfileForm() {
    this.userProfile = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: [
        '',
        [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
      ],
      gender: [null, Validators.required],
      phone: ['', [Validators.pattern('^-?[0-9]+$')]],
      photo: ['', Validators.required],
      photoPaths: [null],
      city: [null, Validators.required],
      country: [null, Validators.required],
      speciality1: [null, [Validators.required, Validators.minLength(1)]],
      qualBa: [false],
      qualBsc: [false],
      qualBcomm: [false],
      qualMa: [false],
      qualMs: [false],
      qualMba: [false],
      qualMapp: [false],
      qualPhd: [false],
      qualAcc: [false],
      qualPcc: [false],
      qualMcc: [false],
      qualOther: [false],
      qualEia: [false],
      qualEqa: [false],
      qualEsia: [false],
      qualEsqa: [false],
      qualIsmcp: [false],
      qualApecs: [false],
      qualEcas: [false],
      qualCas: [false],
      qualCsa: [false],
      qualSa: [false],
      proSummary: ['', [Validators.required, Validators.minLength(this.summaryMinLength), Validators.maxLength(this.summaryMaxLength)]],
      profileUrl: [''],
      fullDescription: [''],
      goalTags: [this.formBuilder.array([new FormControl('', [Validators.minLength(this.goalTagMinLength), Validators.maxLength(this.goalTagMaxLength)])]), Validators.compose([Validators.maxLength(this.goalTagsMax)])],
      credentials: [this.formBuilder.array([new FormControl('', [Validators.minLength(this.credentialMinLength), Validators.maxLength(this.credentialMaxLength)])]), Validators.compose([Validators.maxLength(this.credentialsMax)])],
      remotePractice: [true],
      freeConsultation: [false],
      payHourly: [false],
      payMonthly: [false],
      payPerSession: [false],
      hourlyRate: new FormControl({value: '', disabled: true}),
      sessionRate: new FormControl({value: '', disabled: true}),
      monthlyRate: new FormControl({value: '', disabled: true}),
      currency: [''],
      facebook: [''],
      twitter: [''],
      linkedin: [''],
      youtube: [''],
      instagram: [''],
      website: [''],
      isPublic: [false],
      selectedProfileVideo: [null],
      dateCreated: [null],
      includeInCoachingForCoaches: [false],
      onlyIncludeInCoachingForCoaches: [false]
    }, {
      validators: [
        UrlScheme('facebook'),
        UrlScheme('twitter'),
        UrlScheme('linkedin'),
        UrlScheme('youtube'),
        UrlScheme('instagram'),
        UrlScheme('website')
      ]
    });
  }

  loadUserProfileData(p) {
    this.shareProfile = p;
    console.log(p);
    // Patch user data into the built profile form
    this.userProfile.patchValue({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      gender: p.gender ? p.gender : null,
      phone: p.phone,
      photo: p.photo,
      city: p.city,
      country: (p.country && p.country.code) ? p.country.code : null,
      speciality1: (p.speciality1 && p.speciality1.id) ? p.speciality1.id : null,
      qualBa: p.qualBa ? p.qualBa : null,
      qualBsc: p.qualBsc ? p.qualBsc : null,
      qualBcomm: p.qualBcomm ? p.qualBcomm : null,
      qualMa: p.qualMa ? p.qualMa : null,
      qualMs: p.qualMs ? p.qualMs : null,
      qualMba: p.qualMba ? p.qualMba : null,
      qualMapp: p.qualMapp ? p.qualMapp : null,
      qualPhd: p.qualPhd ? p.qualPhd : null,
      qualAcc: p.qualAcc ? p.qualAcc : null,
      qualPcc: p.qualPcc ? p.qualPcc : null,
      qualMcc: p.qualMcc ? p.qualMcc : null,
      qualOther: p.qualOther ? p.qualOther : null,
      qualEia: p.qualEia ? p.qualEia : null,
      qualEqa: p.qualEqa ? p.qualEqa : null,
      qualEsia: p.qualEsia ? p.qualEsia : null,
      qualEsqa: p.qualEsqa ? p.qualEsqa : null,
      qualIsmcp: p.qualIsmcp ? p.qualIsmcp : null,
      qualApecs: p.qualApecs ? p.qualApecs : null,
      qualEcas: p.qualEcas ? p.qualEcas : null,
      qualCas: p.qualCas ? p.qualCas : null,
      qualCsa: p.qualCsa ? p.qualCsa : null,
      qualSa: p.qualSa ? p.qualSa : null,
      proSummary: p.proSummary,
      profileUrl: p.profileUrl ? p.profileUrl : `${environment.baseUrl}/coach/${this.userId}`,
      fullDescription: p.fullDescription ? p.fullDescription : '',
      goalTags: this.importGoalTags(p.goalTags),
      credentials: this.importCredentials(p.credentials),
      remotePractice: p.remotePractice ? p.remotePractice : true,
      freeConsultation: p.freeConsultation ? p.freeConsultation : false,
      payHourly: p.payHourly ? p.payHourly : false,
      payMonthly: p.payMonthly ? p.payMonthly : false,
      payPerSession: p.payPerSession ? p.payPerSession : false,
      hourlyRate: p.hourlyRate,
      sessionRate: p.sessionRate,
      monthlyRate: p.monthlyRate,
      currency: p.currency ? p.currency : '',
      facebook: p.facebook ? p.facebook : '',
      twitter: p.twitter ? p.twitter : '',
      linkedin: p.linkedin ? p.linkedin : '',
      youtube: p.youtube ? p.youtube : '',
      instagram: p.instagram ? p.instagram : '',
      website: p.website ? p.website : '',
      selectedProfileVideo: p.selectedProfileVideo ? p.selectedProfileVideo : null,
      isPublic: p.isPublic ? p.isPublic : false,
      dateCreated: p.dateCreated ? p.dateCreated : Math.round(new Date().getTime() / 1000), // unix timestamp if missing
      photoPaths: p.photoPaths ? p.photoPaths : null,
      includeInCoachingForCoaches : p.includeInCoachingForCoaches ? p.includeInCoachingForCoaches : false,
      onlyIncludeInCoachingForCoaches : p.onlyIncludeInCoachingForCoaches ? p.onlyIncludeInCoachingForCoaches : false
    });

    if (p.selectedProfileVideo) {
      this.videoSources = []; // reset
      this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
        src: p.selectedProfileVideo
      });
    }

    // init the character counts (before user input detected)
    this.summaryActualLength = this.profileF.proSummary.value.length;

    this.fetchedProfile = true;
  }

  importGoalTags(tagsArray: any[]) {
    // transform saved array of objects into a string formArray to work with in the form
    const array = this.formBuilder.array([]);
    if (tagsArray) {
      tagsArray.forEach(obj => {
        array.controls.push(new FormControl(obj.value, [Validators.minLength(this.goalTagMinLength), Validators.maxLength(this.goalTagMaxLength)]));
      });
    }
    return array;
  }

  addGoalTag() {
    const control = new FormControl('', [Validators.minLength(this.goalTagMinLength), Validators.maxLength(this.goalTagMaxLength)]);
    this.profileF.goalTags.value.controls.push(control);
  }

  removeGoalTag(index: number) {
    this.profileF.goalTags.value.controls.splice(index, 1);
  }

  importCredentials(credsArray: any[]) {
    // transform saved array of objects into a string formArray to work with in the form
    const array = this.formBuilder.array([]);
    if (credsArray) {
      credsArray.forEach(obj => {
        array.controls.push(new FormControl(obj.value, [Validators.minLength(this.credentialMinLength), Validators.maxLength(this.credentialMaxLength)]));
      });
    }
    return array;
  }

  addCredential() {
    const control = new FormControl('', [Validators.minLength(this.credentialMinLength), Validators.maxLength(this.credentialMaxLength)]);
    this.profileF.credentials.value.controls.push(control);
  }

  removeCredential(index: number) {
    this.profileF.credentials.value.controls.splice(index, 1);
  }

  buildShareForm() {
    this.shareForm = this.formBuilder.group({
      shareUrl: null
    });
  }

  updateShareForm() {
    this.shareForm.patchValue({
      shareUrl: `${environment.baseUrl}/coach/${this.userId}`
    });
  }

  showError(control: string, error: string) {
    // console.log(`Form error. Control: ${control}. Error: ${error}`);
    if (this.ErrorMessages[control][error]) {
      return this.ErrorMessages[control][error];
    }
    return 'Invalid input';
  }

  receiveMessage($event: any) {
    /*
      Triggered by the 'messageEvent' listener on the component template.
      The child 'picture-upload-component' will emit a chosen file when
      an image is chosen. We'll listen for that change here and grab the
      selected file for saving to storage & patching into our form control.
    */
    console.log(`Updating profile form photo with: ${$event}`);
    this.userProfile.patchValue({
      photo: $event
    });
  }

  get profileF(): any {
    return this.userProfile.controls;
  }

  getCountryFlag() {
    if (!this.profileF.country.value) {
      return '';
    }
    // console.log(this.profileF.country.value);
    const ct = this.countryService.getCountryByCode(this.profileF.country.value);
    if (!ct || !ct.emoji) {
      return '';
    }
    return ct.emoji;
  }

  getCountryName() {
    if (!this.profileF.country.value) {
      return '';
    }
    // console.log(this.profileF.country.value);
    const ct = this.countryService.getCountryByCode(this.profileF.country.value);
    if (!ct || !ct.name) {
      return '';
    }
    return ct.name;
  }

  onVideoChange(ev: any) {
    console.log(ev.target.id);
    this.videoSources = []; // reset
    this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
      src: ev.target.id
    });
    this.userProfile.patchValue({selectedProfileVideo: ev.target.id});
  }

  onVideoRemove(i: number) {
    // Remove from storage
    this.storageService.deleteProfileVideoFromStorage(this.userId, this.profileVideos[i].path);
    // Remove db data
    this.dataService.deleteProfileVideoData(this.userId, this.profileVideos[i].id);
  }

  onPublicSettingToggle(ev: any) {
    // console.log('Profile is public:', ev);
    this.userProfile.patchValue({isPublic: ev.currentValue});
  }

  onSummaryInput(ev: any) {
    this.summaryActualLength = (ev.target.value as string).length;
  }

  onIncludeInCoachingForCoachesToggle(ev: any) {
    this.userProfile.patchValue({includeInCoachingForCoaches: ev.currentValue});
  }

  onOnlyIncludeInCoachingForCoachesToggle(ev: any) {
    this.userProfile.patchValue({onlyIncludeInCoachingForCoaches: ev.currentValue});
  }

  async onSubmit() {

    this.saveAttempt = true;
    this.savingProfile = true;

    // safety checks

    if (this.userProfile.invalid) {
      for (const key of Object.keys(this.profileF)) {
        if (this.profileF[key].invalid) {
          console.log(`Missing profile data: ${key}.`);
          console.dir(this.profileF[key]);
        }
      }
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.savingProfile = false;
      return;
    }

    console.log('Profile is valid:', this.userProfile.value);

    const saveProfile = this.userProfile.value; // capture the form value as a new object to save

    // update the country data from just country code to the full country object.
    const ct = this.countryService.getCountryByCode(this.profileF.country.value);
    saveProfile.country = ct;

    // update the speciality data from just speciality id to the full speciality object.
    const spec = this.specialitiesService.getSpecialityById(this.profileF.speciality1.value);
    saveProfile.speciality1 = spec;

    // Restructure the goalTags from string formArray into the object array structure required
    const goalObjArr = [];
    this.userProfile.value.goalTags.controls.forEach(formCtrl => {
      if (formCtrl.value !== '') { // exclude empty strings
        goalObjArr.push({display: formCtrl.value, value: formCtrl.value});
      }
    });
    saveProfile.goalTags = goalObjArr;

    // Restructure the credentials from string formArray into the object array structure required
    const credObjArr = [];
    this.userProfile.value.credentials.controls.forEach(formCtrl => {
      if (formCtrl.value !== '') { // exclude empty strings
        credObjArr.push({display: formCtrl.value, value: formCtrl.value});
      }
    });
    saveProfile.credentials = credObjArr;

    // Handle image upload to storage if required.
    if (!this.profileF.photo.value.includes(this.storageService.getStorageDomain())) {
      // console.log(`Uploading unstored photo to storage...`);

      // const url = await this.storageService.storePhotoUpdateDownloadUrl(this.userId, this.profileF.photo.value);
      const response = await this.cloudFunctions
        .uploadUserAvatar({uid: this.userId, img: this.profileF.photo.value})
        .catch(e => console.log(e));

      // @ts-ignore
      const url = await response.original.fullSize || '';

      console.log('value of user`s avatar:', this.profileF.photo.value);
      // const url = await this.cloudFunctions.uploadProgramImage({uid: this.userId, img: this.profileF.photo.value})
      // console.log(`Photo stored successfully. Patching profile form with photo download URL: ${url}`);
      this.userProfile.patchValue({
        photo: url,
        photoPaths: await response
      });
      console.log('Response is', await response);
      saveProfile.photo = url;
      saveProfile.photoPaths = await response;
    }

    // Save the form to the DB
    // console.log(`Saving profile form to DB:`, saveProfile);

    await this.dataService.saveCoachProfile(this.userId, saveProfile);
    // if (this.profileF.isPublic.value) {
    //   this.dataService.completeUserTask(this.userId, 'taskDefault002'); // this is done by default now
    // }

    this.alertService.alert('auto-close', 'Success!', 'Profile updated successfully.');
    this.analyticsService.saveUserProfile(saveProfile);

    this.savingProfile = false;
    this.saveAttempt = false;
  }

  copyShareUrl(element: any) {
    // Copy to the clipboard.
    // Note: Don't try this in SSR environment unless injecting document!
    // console.log('copy clicked', element);
    element.select();
    document.execCommand('copy');
    element.setSelectionRange(0, 0);
    this.alertService.alert('auto-close', 'Copied!', 'Link copied to clipboard.');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
