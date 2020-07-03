import { Component } from '@angular/core';

import { AuthService} from './services/auth.service';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public userAuthorised = false;

  constructor(
    private authService: AuthService,
    private analytics: AnalyticsService
    ) {

    // Initialise analytics
    this.analytics.init();

    // Monitor the user's auth state
    // this.authService.getAuthUser().subscribe(user => {
    //   if (user) {
    //     console.log('User is authorised');
    //     // Auth state is not null. User is authorised.
    //     this.userAuthorised = true;
    //     // Check the user's custom auth claims.
    //     // user.getIdTokenResult()
    //     // .then(tokenRes => {
    //     //   console.log('Custom user claims:', tokenRes.claims);
    //     // });
    //   } else {
    //     // User is not authorised.
    //     console.log('User not authorised.');
    //     this.userAuthorised = false;
    //   }
    // });
  }

}
