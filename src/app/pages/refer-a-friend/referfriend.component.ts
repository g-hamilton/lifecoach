import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { AnalyticsService } from '../../services/analytics.service';

import { UserAccount } from '../../interfaces/user.account.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-refer-friend',
  templateUrl: 'referfriend.component.html'
})
export class ReferFriendComponent implements OnInit, OnDestroy {

  private userId: string;

  public accountForm: FormGroup;
  public submitted = false;
  public focus: boolean;
  public focus1: boolean;
  public focusTouched: boolean;
  public focus1Touched: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private cloudFunctionsService: CloudFunctionsService,
    private analyticsService: AnalyticsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    // Register a page view if we're in the browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.analyticsService.pageView();
    }

    // Build the form
    this.buildAccountForm();

    // Update the form with saved user data
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.subscriptions.add(
              this.dataService.getUserAccount(user.uid)
                .subscribe(account => {
                  if (account) {
                    this.updateAccountForm(account);
                  }
                })
            );
          }
        })
    );
  }

  buildAccountForm() {
    this.accountForm = this.formBuilder.group({
      dateCreated: [''],
      accountType: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      accountEmail: new FormControl({value: '', disabled: true})
    });
  }

  updateAccountForm(account: UserAccount) {
    this.accountForm.patchValue({
      dateCreated: account.dateCreated,
      accountType: account.accountType,
      firstName: account.firstName,
      lastName: account.lastName,
      accountEmail: account.accountEmail
    });
  }

  get accountF(): any {
    return this.accountForm.controls;
  }

  async onSubmit() {
    if (true) {
      this.submitted = true;
      const aT = this.accountF.accountType.value;
      const eM = this.accountF.accountEmail.value;
      const fN = this.accountF.firstName.value;
      const lN = this.accountF.lastName.value;

      this.submitted = false;
      this.alertService.alert('success-message', 'Success!', '.');
      // this.analyticsService.referFriend();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
