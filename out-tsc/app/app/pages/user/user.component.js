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
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
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
let UserComponent = class UserComponent {
    constructor(platformId, cdRef, authService, route, dataService, formBuilder, countryService, currencyService, specialitiesService, analyticsService, storageService, alertService) {
        this.platformId = platformId;
        this.cdRef = cdRef;
        this.authService = authService;
        this.route = route;
        this.dataService = dataService;
        this.formBuilder = formBuilder;
        this.countryService = countryService;
        this.currencyService = currencyService;
        this.specialitiesService = specialitiesService;
        this.analyticsService = analyticsService;
        this.storageService = storageService;
        this.alertService = alertService;
        this.browser = false;
        this.fetchedProfile = false;
        this.savingProfile = false;
        this.countryList = this.countryService.getCountryList();
        this.currencyList = this.currencyService.getCurrenciesAsArray();
        this.specialityList = this.specialitiesService.getSpecialityList();
        this.separatorKeysCodes = [ENTER, COMMA];
        this.goalTagMaxLength = 40;
        this.goalTagsMax = 3;
        this.ErrorMessages = {
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
            learningPoints: {
                maxLength: `Specialist area must be below ${this.goalTagMaxLength} characters`,
                includesComma: `Please only add one specialist area per line`
            }
        };
        this.objKeys = Object.keys;
        this.videoSources = [];
        this.subscriptions = new Subscription();
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
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe((user) => __awaiter(this, void 0, void 0, function* () {
            if (user) {
                // As this component is shared by users and admins: if admin, check for route params for user ID,
                // otherwise get user ID from auth object
                const tokenResult = yield user.getIdTokenResult();
                const claims = tokenResult.claims;
                if (claims && claims.admin) { // admin user on behalf of user
                    console.log('User is an admin');
                    this.route.params.subscribe(params => {
                        if (params.uid) {
                            this.userId = params.uid;
                            this.monitorUserProfile();
                        }
                    });
                }
                else { // non-admin user editing own profile
                    this.userId = user.uid;
                    this.monitorUserProfile();
                }
            }
        })));
    }
    monitorUserProfile() {
        this.updateShareForm();
        this.subscriptions.add(this.dataService.getCoachProfile(this.userId)
            .subscribe(profile => {
            if (profile && profile.dateCreated) {
                console.log('Fetched user profile:', profile);
                this.loadUserProfileData(profile);
            }
            else { // if no profile exists, load the wizard
                this.loadWizard = true;
            }
        }));
        this.subscriptions.add(this.dataService.getProfileVideos(this.userId)
            .subscribe(videos => {
            console.log('Profile videos:', videos);
            if (videos && videos.length > 0) {
                const sortedByLastUploaded = videos.sort((a, b) => a.lastUploaded - b.lastUploaded);
                this.profileVideos = sortedByLastUploaded;
                // Set the last uploaded video as the active video
                this.videoSources = []; // reset
                this.videoSources.push({
                    src: this.profileVideos[this.profileVideos.length - 1].downloadURL
                });
                this.userProfile.patchValue({ selectedProfileVideo: this.profileVideos[this.profileVideos.length - 1].downloadURL });
            }
            else {
                this.profileVideos = null;
            }
        }));
    }
    buildProfileForm() {
        this.userProfile = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(1)]],
            lastName: ['', [Validators.required, Validators.minLength(1)]],
            email: [
                '',
                [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
            ],
            phone: ['', [Validators.pattern('^-?[0-9]+$')]],
            photo: ['', Validators.required],
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
            proSummary: ['', [Validators.required, Validators.minLength(90), Validators.maxLength(210)]],
            profileUrl: [''],
            fullDescription: [''],
            goalTags: [this.formBuilder.array([new FormControl('', [Validators.maxLength(this.goalTagMaxLength)])]), Validators.compose([Validators.required, Validators.maxLength(this.goalTagsMax)])],
            remotePractice: [true],
            freeConsultation: [false],
            payHourly: [false],
            payMonthly: [false],
            payPerSession: [false],
            hourlyRate: new FormControl({ value: '', disabled: true }),
            sessionRate: new FormControl({ value: '', disabled: true }),
            monthlyRate: new FormControl({ value: '', disabled: true }),
            currency: [''],
            facebook: [''],
            twitter: [''],
            linkedin: [''],
            youtube: [''],
            instagram: [''],
            website: [''],
            isPublic: [false],
            selectedProfileVideo: [null],
            dateCreated: [null]
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
        // Patch user data into the built profile form
        this.userProfile.patchValue({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
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
            profileUrl: p.profileUrl ? p.profileUrl : `https://lifecoach.io/coach/${this.userId}`,
            fullDescription: p.fullDescription ? p.fullDescription : '',
            goalTags: this.importGoalTags(p.goalTags),
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
            dateCreated: p.dateCreated ? p.dateCreated : Math.round(new Date().getTime() / 1000) // unix timestamp if missing
        });
        if (p.selectedProfileVideo) {
            this.videoSources = []; // reset
            this.videoSources.push({
                src: p.selectedProfileVideo
            });
        }
        this.fetchedProfile = true;
    }
    importGoalTags(tagsArray) {
        // transform saved array of objects into a string formArray to work with in the form
        const array = this.formBuilder.array([]);
        tagsArray.forEach(obj => {
            array.controls.push(new FormControl(obj.value, [Validators.maxLength(this.goalTagMaxLength)]));
        });
        return array;
    }
    addGoalTag() {
        const control = new FormControl('', [Validators.maxLength(this.goalTagMaxLength)]);
        this.profileF.goalTags.value.controls.push(control);
    }
    removeGoalTag(index) {
        this.profileF.goalTags.value.controls.splice(index, 1);
    }
    buildShareForm() {
        this.shareForm = this.formBuilder.group({
            shareUrl: null
        });
    }
    updateShareForm() {
        this.shareForm.patchValue({
            shareUrl: `https://lifecoach.io/coach/${this.userId}`
        });
    }
    showError(control, error) {
        console.log(`Form error. Control: ${control}. Error: ${error}`);
        if (this.ErrorMessages[control][error]) {
            return this.ErrorMessages[control][error];
        }
        return 'Invalid input';
    }
    receiveMessage($event) {
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
    get profileF() {
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
    onVideoChange(ev) {
        console.log(ev.target.id);
        this.videoSources = []; // reset
        this.videoSources.push({
            src: ev.target.id
        });
        this.userProfile.patchValue({ selectedProfileVideo: ev.target.id });
    }
    onVideoRemove(i) {
        // Remove from storage
        this.storageService.deleteProfileVideoFromStorage(this.userId, this.profileVideos[i].path);
        // Remove db data
        this.dataService.deleteProfileVideoData(this.userId, this.profileVideos[i].id);
    }
    onPublicSettingToggle(ev) {
        // console.log('Profile is public:', ev);
        this.userProfile.patchValue({ isPublic: ev.currentValue });
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userProfile.valid) {
                // update the form data from just country code to the full country object.
                const ct = this.countryService.getCountryByCode(this.profileF.country.value);
                this.userProfile.patchValue({ country: ct });
                // update the form data from just speciality id to the full speciality object.
                const spec = this.specialitiesService.getSpecialityById(this.profileF.speciality1.value);
                this.userProfile.patchValue({ speciality1: spec });
                console.log('Profile is valid:', this.userProfile.value);
                const saveProfile = JSON.parse(JSON.stringify(this.userProfile.value));
                // Restructure the goalTags from string formArray into the object array structure required
                const objArr = [];
                this.userProfile.value.goalTags.controls.forEach(formCtrl => {
                    if (formCtrl.value !== '') { // exclude empty tags
                        objArr.push({ display: formCtrl.value, value: formCtrl.value });
                    }
                });
                saveProfile.goalTags = objArr;
                // Handle image upload to storage if required.
                if (!this.profileF.photo.value.includes(this.storageService.getStorageDomain())) {
                    console.log(`Uploading unstored photo to storage...`);
                    const url = yield this.storageService.storePhotoUpdateDownloadUrl(this.userId, this.profileF.photo.value);
                    console.log(`Photo stored successfully. Patching profile form with photo download URL: ${url}`);
                    this.userProfile.patchValue({
                        photo: url
                    });
                    saveProfile.photo = url;
                }
                // Save the form to the DB
                console.log(`Saving profile form to DB:`, saveProfile);
                this.savingProfile = true;
                yield this.dataService.saveCoachProfile(this.userId, saveProfile);
                if (this.profileF.isPublic.value) {
                    this.dataService.completeUserTask(this.userId, 'taskDefault002');
                }
                this.alertService.alert('success-message', 'Success!', 'Profile updated successfully.');
                this.analyticsService.saveUserProfile(saveProfile);
                this.savingProfile = false;
            }
            else {
                console.log('Invalid profile!');
                for (const key of Object.keys(this.profileF)) {
                    if (this.profileF[key].invalid) {
                        console.log(`Missing profile data: ${key}`);
                        this.alertService.alert('warning-message', 'One moment...', `Please check all required fields.`);
                    }
                }
            }
        });
    }
    copyShareUrl(element) {
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
};
UserComponent = __decorate([
    Component({
        selector: 'app-user',
        templateUrl: 'user.component.html',
        styleUrls: ['./user.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, ChangeDetectorRef,
        AuthService,
        ActivatedRoute,
        DataService,
        FormBuilder,
        CountryService,
        CurrencyService,
        CoachingSpecialitiesService,
        AnalyticsService,
        StorageService,
        AlertService])
], UserComponent);
export { UserComponent };
//# sourceMappingURL=user.component.js.map