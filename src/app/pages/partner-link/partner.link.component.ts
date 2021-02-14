import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-partner-link',
  templateUrl: 'partner.link.component.html',
  styleUrls: ['./partner.link.component.scss']
})
export class PartnerLinkComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public account: UserAccount;
  public partnerForm: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    public formBuilder: FormBuilder,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildPartnerForm();
      this.getUserData();
    }
  }

  buildPartnerForm() {
    this.partnerForm = this.formBuilder.group({
      trackingCode: null
    });
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          this.checkPayoutsEnabled();
          this.updatePartnerForm();
        }
      })
    );
  }

  updatePartnerForm() {
    this.partnerForm.patchValue({
      trackingCode: `?partner=${this.userId}`
    });
  }

  checkPayoutsEnabled() {
    this.subscriptions.add(
        this.dataService.getUserAccount(this.userId).subscribe(userAccount => {
            if (userAccount) {
                this.account = userAccount;
                console.log('User Account:', this.account);
            }
          }
        )
    );
  }

  copyTrackingCode(element: any) {
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
