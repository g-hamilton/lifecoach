import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { SsoService } from 'app/services/sso.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private uid: string;
  myDate: Date = new Date();

  public feedbackUrl = 'https://lifecoach.nolt.io';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private ssoService: SsoService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  async loadUserData() {
    // Get user ID
    const tempAuthSub = this.authService.getAuthUser()
    .subscribe(user => {
      if (user) { // User is authorised
        this.uid = user.uid; // <-- Ensure we get an authorised uid before calling for user data

        // Get a SSO token for this user
        this.getUserSSOToken();
      }
    });
  }

  async getUserSSOToken() {
    const token = await this.ssoService.getSsoToken(this.uid);
    if (token) {
      this.feedbackUrl = `https://lifecoach.nolt.io/sso/${token}`;
    }
  }

}
