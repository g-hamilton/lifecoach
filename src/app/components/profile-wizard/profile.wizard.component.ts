import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
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

import { UserAccount } from '../../interfaces/user.account.interface';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import {CloudFunctionsService} from '../../services/cloud-functions.service';

@Component({
  selector: 'app-profile-wizard',
  templateUrl: 'profile.wizard.component.html',
  styleUrls: ['./profile.wizard.scss']
})
export class ProfileWizardComponent implements OnInit, OnDestroy {

  public browser = false;

  private userId: string;

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

  public formWizard: FormGroup;
  public saveAttempt: boolean;
  public saving: boolean;

  public countryList: any;
  public currencyList: any;
  public specialityList: any;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  public objKeys = Object.keys;

  public summaryMinLength = 90;
  public summaryMaxLength = 120;

  public goalTagMaxLength = 40;
  public goalTagsMax = 3;

  public ErrorMessages = {
    proSummary: {
      required: `Please enter a short summary`,
      minlength: `This summary should be at least ${this.summaryMinLength} characters.`,
      maxlength: `This summary should be at less than ${this.summaryMaxLength} characters.`
    },
    learningPoints: {
      maxLength: `Specialist area must be below ${this.goalTagMaxLength} characters`,
    }
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private authService: AuthService,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private specialitiesService: CoachingSpecialitiesService,
    private dataService: DataService,
    private analyticsService: AnalyticsService,
    private toastService: ToastService,
    private cloudFunctions: CloudFunctionsService
  ) {
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
          photo: ['', Validators.required],
          photoPaths: [null],
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
          proSummary: ['', [Validators.required, Validators.minLength(90), Validators.minLength(this.summaryMinLength), Validators.maxLength(this.summaryMaxLength)]],
          goalTags: [this.formBuilder.array([new FormControl('', Validators.maxLength(this.goalTagMaxLength))]), Validators.compose([Validators.required, Validators.maxLength(this.goalTagsMax)])],
          isPublic: [true], // default to public display on
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
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;

            this.subscriptions.add(
              this.dataService.getUserAccount(this.userId)
                .subscribe((account: UserAccount) => {
                  if (account) {
                    this.formWizard.patchValue({
                      firstName: account.firstName,
                      lastName: account.lastName,
                      email: account.accountEmail,
                      profileUrl: `${environment.baseUrl}/coach/${user.uid}`
                    });
                  }
                })
            );
          }
        })
    );
  }

  get wizardF(): any {
    return this.formWizard.controls;
  }

  get formArray() {
    return this.formWizard.controls.formArray as FormArray;
  }

  get group0() {
    return ((this.formWizard.controls.formArray as FormArray).controls[0] as FormGroup).controls;
  }

  get group1() {
    return ((this.formWizard.controls.formArray as FormArray).controls[1] as FormGroup).controls;
  }

  get group2() {
    return ((this.formWizard.controls.formArray as FormArray).controls[2] as FormGroup).controls;
  }

  get group3() {
    return ((this.formWizard.controls.formArray as FormArray).controls[3] as FormGroup).controls;
  }

  onNextClick() {
    this.saveAttempt = true;
  }

  onStepChange(event: any) {
    // console.log('STEP CHANGED!', event);
    setTimeout(() => {
      this.saveAttempt = false;
    }, 10);
  }

  showError(control: string, error: string) {
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
      selected file for patching into our form control.
    */
    ((this.formWizard.controls.formArray as FormArray).controls[1] as FormGroup).patchValue({photo: $event});
  }

  addGoalTag() {
    const control = new FormControl('', Validators.maxLength(this.goalTagMaxLength));
    this.group3.goalTags.value.controls.push(control);
  }

  removeGoalTag(index: number) {
    this.group3.goalTags.value.controls.splice(index, 1);
  }

  async onSubmit() {
    this.saveAttempt = true;
    this.saving = true;

    // safety checks

    if (this.formWizard.invalid) {
      console.log(this.formWizard.value);
      for (const key of Object.keys(this.wizardF)) {
        if (this.wizardF[key].invalid) {
          console.log(key); // let's see what went wrong
        }
      }
      this.alertService.alert('warning-message', 'Oops', 'Please complete all required fields before saving.');
      this.saving = false;
      return;
    }

    // safe

    /*
      Handle image upload to storage in the background.
      If the img in the form has not already been stored remotely, store it now.
      Will update the form with the new remote URL or fall back to the dataUrl if unsuccessful.
    */
    const currentImg: string = this.group1.photo.value;
    if (!currentImg.includes(this.storageService.getStorageDomain())) {

      const response = await this.cloudFunctions
        .uploadUserAvatar({uid: this.userId, img: currentImg})
        .catch(e => console.log(e));


      /*
         New version
      */
      // @ts-ignore
      const url = await response.original.fullSize || '';
      ((this.formWizard.controls.formArray as FormArray).controls[1] as FormGroup).patchValue({photo: url, photoPaths: await response});
      /*
         End of new version
      */

      /*
        Old Version for tests
       */

      // const downloadUrl = await this.storageService.storePhotoUpdateDownloadUrl(this.userId, currentImg);
      // ((this.formWizard.controls.formArray as FormArray).controls[1] as FormGroup).patchValue({photo: downloadUrl});

      /*
      End of old version
       */
      // console.log('Form updated with photo storage download URL:', this.group1.photo.value);
    }

    // Ask user if they want to make their profile public at this point
    // const qResult: any = await this.alertService.alert('question-and-confirmation', 'Go Public?', `Would you like to make your profile
    // public now so potential clients can see it?`, 'Yes please!', 'Not now', 'Done!', `Your profile will be
    // avalable for clients to see.`, 'OK', `Got it! You can always go public later on when you're ready.`);
    // if (qResult.action) { // user wants to go public now
    //   ((this.formWizard.controls.formArray as FormArray).controls[3] as FormGroup).patchValue({
    //     isPublic: true
    //   });
    //   this.dataService.completeUserTask(this.userId, 'taskDefault002'); // mark the 'go public' todo as done
    // }

    // update the form data from just country code to the full country object.
    const ct = this.countryService.getCountryByCode(this.group2.country.value);
    this.group2.country.patchValue(ct);

    // update the form data from just speciality id to the full speciality object.
    const spec = this.specialitiesService.getSpecialityById(this.group3.speciality1.value);
    this.group3.speciality1.patchValue(spec);

    // Restructure the goalTags from string formArray into the object array structure required
    const objArr = [];
    (this.group3.goalTags.value.controls as any[]).forEach(control => {
      if (control.value !== '') { // exclude empty tags
        objArr.push({display: control.value, value: control.value});
      }
    });
    this.group3.goalTags.patchValue(objArr);

    // Restructure the form data as a flat object for sending to the DB
    const a = JSON.parse(JSON.stringify(((this.formWizard.controls.formArray as FormArray).controls[0] as FormGroup).value));
    const b = JSON.parse(JSON.stringify(((this.formWizard.controls.formArray as FormArray).controls[1] as FormGroup).value));
    const c = JSON.parse(JSON.stringify(((this.formWizard.controls.formArray as FormArray).controls[2] as FormGroup).value));
    const d = JSON.parse(JSON.stringify(((this.formWizard.controls.formArray as FormArray).controls[3] as FormGroup).value));
    const merged = {...a, ...b, ...c, ...d};

    // console.log(merged);

    // alert
    await this.alertService.alert('success-message', 'Nice Work!', `Your basic profile is live on Lifecoach & ready to start capturing leads. Feel free to keep building on your profile. As you add products & services they will automatically be linked to your profile page.`);

    // Save the profile
    await this.dataService.saveCoachProfile(this.userId, merged);
    this.dataService.completeUserTask(this.userId, 'taskDefault001'); // mark the 'create profile' todo as done
    this.analyticsService.saveUserProfile(merged);
    this.saving = false;
    this.saveAttempt = false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
