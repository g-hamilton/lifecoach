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
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AlertService } from '../../services/alert.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { CountryService } from '../../services/country.service';
import { CurrencyService } from '../../services/currency.service';
import { CoachingSpecialitiesService } from '../../services/coaching.specialities.service';
import { DataService } from '../../services/data.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
let ProfileWizardComponent = class ProfileWizardComponent {
    constructor(document, platformId, formBuilder, alertService, storageService, authService, countryService, currencyService, specialitiesService, dataService, analyticsService, toastService) {
        this.document = document;
        this.platformId = platformId;
        this.formBuilder = formBuilder;
        this.alertService = alertService;
        this.storageService = storageService;
        this.authService = authService;
        this.countryService = countryService;
        this.currencyService = currencyService;
        this.specialitiesService = specialitiesService;
        this.dataService = dataService;
        this.analyticsService = analyticsService;
        this.toastService = toastService;
        this.browser = false;
        this.separatorKeysCodes = [ENTER, COMMA];
        this.objKeys = Object.keys;
        this.maxSummaryLength = 210;
        this.goalTagMaxLength = 40;
        this.goalTagsMax = 3;
        this.ErrorMessages = {
            learningPoints: {
                maxLength: `Specialist area must be below ${this.goalTagMaxLength} characters`,
            }
        };
        this.subscriptions = new Subscription();
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.buildWizardForm();
            this.getUserAccountData();
            this.getFormData();
        }
    }
    getFormData() {
        this.countryList = this.countryService.getCountryList();
        this.currencyList = this.currencyService.getCurrenciesAsArray();
        this.specialityList = this.specialitiesService.getSpecialityList();
    }
    buildWizardForm() {
        // Build the profile form. Grouped for stepper controls.
        this.formWizard = this.formBuilder.group({
            formArray: this.formBuilder.array([
                // Group 0
                this.formBuilder.group({
                    firstName: ['', [Validators.required, Validators.minLength(1)]],
                    lastName: ['', [Validators.required, Validators.minLength(1)]],
                    email: [
                        '',
                        [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]
                    ],
                    phone: ['', [Validators.pattern('^-?[0-9]+$')]]
                }),
                // Group 1
                this.formBuilder.group({
                    photo: ['', Validators.required]
                }),
                // Group 2
                this.formBuilder.group({
                    city: ['', Validators.required],
                    country: [null, Validators.required]
                }),
                // Group 3
                this.formBuilder.group({
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
                    proSummary: ['', [Validators.required, Validators.minLength(90), Validators.maxLength(this.maxSummaryLength)]],
                    goalTags: [this.formBuilder.array([new FormControl('', Validators.maxLength(this.goalTagMaxLength))]), Validators.compose([Validators.required, Validators.maxLength(this.goalTagsMax)])],
                    isPublic: [false],
                    profileUrl: [''],
                    dateCreated: [Math.round(new Date().getTime() / 1000)] // unix timestamp
                })
            ])
        });
    }
    getUserAccountData() {
        /*
          Subscribes to the user's auth state to retreive their uid,
          then subscribes to the user's account data to pre-populate
          form fields we may know about, but we still allow profile
          to differ from account data as the profile is public while
          the account data is private.
        */
        this.subscriptions.add(this.authService.getAuthUser()
            .subscribe(user => {
            if (user) {
                this.userId = user.uid;
                this.subscriptions.add(this.dataService.getUserAccount(this.userId)
                    .subscribe((account) => {
                    if (account) {
                        this.formWizard.patchValue({
                            firstName: account.firstName,
                            lastName: account.lastName,
                            email: account.accountEmail,
                            profileUrl: `https://lifecoach.io/coach/${user.uid}`
                        });
                    }
                }));
            }
        }));
    }
    get wizardF() {
        return this.formWizard.controls;
    }
    get formArray() {
        return this.formWizard.controls.formArray;
    }
    get group0() {
        return this.formWizard.controls.formArray.controls[0].controls;
    }
    get group1() {
        return this.formWizard.controls.formArray.controls[1].controls;
    }
    get group2() {
        return this.formWizard.controls.formArray.controls[2].controls;
    }
    get group3() {
        return this.formWizard.controls.formArray.controls[3].controls;
    }
    onNextClick() {
        this.wizard = true;
    }
    onStepChange(event) {
        // console.log('STEP CHANGED!', event);
        setTimeout(() => {
            this.wizard = false;
        }, 10);
    }
    showError(control, error) {
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
          selected file for patching into our form control.
        */
        this.formWizard.controls.formArray.controls[1].patchValue({ photo: $event });
    }
    addGoalTag() {
        const control = new FormControl('', Validators.maxLength(this.goalTagMaxLength));
        this.group3.goalTags.value.controls.push(control);
    }
    removeGoalTag(index) {
        this.group3.goalTags.value.controls.splice(index, 1);
    }
    onSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.wizard = true;
            if (this.formWizard.valid) {
                this.saving = true;
                /*
                  Handle image upload to storage in the background.
                  If the img in the form has not already been stored remotely, store it now.
                  Will update the form with the new remote URL or fall back to the dataUrl if unsuccessful.
                */
                const currentImg = this.group1.photo.value;
                if (!currentImg.includes(this.storageService.getStorageDomain())) {
                    const downloadUrl = yield this.storageService.storePhotoUpdateDownloadUrl(this.userId, currentImg);
                    this.formWizard.controls.formArray.controls[1].patchValue({ photo: downloadUrl });
                    console.log('Form updated with photo storage download URL:', this.group1.photo.value);
                }
                // Ask user if they want to make their profile public at this point
                const qResult = yield this.alertService.alert('question-and-confirmation', 'Go Public?', `Would you like to make your profile
      public now so potential clients can see it?`, 'Yes please!', 'Not now', 'Done!', `Your profile will be
      avalable for clients to see.`, 'OK', `Got it! You can always go public later on when you're ready.`);
                if (qResult.action) { // user wants to go public now
                    this.formWizard.controls.formArray.controls[3].patchValue({
                        isPublic: true
                    });
                    this.dataService.completeUserTask(this.userId, 'taskDefault002'); // mark the 'go public' todo as done
                }
                // update the form data from just country code to the full country object.
                const ct = this.countryService.getCountryByCode(this.group2.country.value);
                this.group2.country.patchValue(ct);
                // update the form data from just speciality id to the full speciality object.
                const spec = this.specialitiesService.getSpecialityById(this.group3.speciality1.value);
                this.group3.speciality1.patchValue(spec);
                // Restructure the goalTags from string formArray into the object array structure required
                const objArr = [];
                this.group3.goalTags.value.controls.forEach(control => {
                    if (control.value !== '') { // exclude empty tags
                        objArr.push({ display: control.value, value: control.value });
                    }
                });
                this.group3.goalTags.patchValue(objArr);
                // Restructure the form data as a flat object for sending to the DB
                const a = JSON.parse(JSON.stringify(this.formWizard.controls.formArray.controls[0].value));
                const b = JSON.parse(JSON.stringify(this.formWizard.controls.formArray.controls[1].value));
                const c = JSON.parse(JSON.stringify(this.formWizard.controls.formArray.controls[2].value));
                const d = JSON.parse(JSON.stringify(this.formWizard.controls.formArray.controls[3].value));
                const merged = Object.assign(Object.assign(Object.assign(Object.assign({}, a), b), c), d);
                console.log(merged);
                // Save the profile
                yield this.dataService.saveCoachProfile(this.userId, merged);
                this.dataService.completeUserTask(this.userId, 'taskDefault001'); // mark the 'create profile' todo as done
                this.analyticsService.saveUserProfile(merged);
                this.saving = false;
                this.wizard = false;
            }
            else { // invalid form
                console.log('Invalid form controls:');
                for (const key of Object.keys(this.wizardF)) {
                    if (this.wizardF[key].invalid) {
                        console.log(key); // let's see what went wrong
                    }
                }
                // Pop an alert
                this.toastService.showToast('Just a moment! Please check you have completed all required info above.', 5000, 'danger', 'bottom', 'center');
            }
        });
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
ProfileWizardComponent = __decorate([
    Component({
        selector: 'app-profile-wizard',
        templateUrl: 'profile.wizard.component.html',
        styleUrls: ['./profile.wizard.scss']
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, FormBuilder,
        AlertService,
        StorageService,
        AuthService,
        CountryService,
        CurrencyService,
        CoachingSpecialitiesService,
        DataService,
        AnalyticsService,
        ToastService])
], ProfileWizardComponent);
export { ProfileWizardComponent };
//# sourceMappingURL=profile.wizard.component.js.map