import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';

/*
  Allows the user to activate a route if they have a paid subscription plan (any paid plan).
*/

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAuthGuardService {

  user: firebase.User;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      return new Promise(resolve => {

        // Check if user authorised
        this.authService.getAuthUser().pipe(first())
          .subscribe(async user => {

            if (!user && isPlatformBrowser(this.platformId)) { // user unauthorised & browser
              console.log('Route guard unauthorised - user not authorised!');
              this.router.navigate(['login']);
              resolve(false);
              return;
            }

            if (user) { // user authorised

              // check user token for permissions
              const res = await user.getIdTokenResult(true);
              // console.log(res.claims);

              // if user is a coach, they must have a paid plan.
              // if not a coach, allow access

              if (res.claims.coach) { // user is a coach
                if (res.claims.subscriptionPlan) { // user has a plan
                  resolve(true);
                  return;
                }
              } else { // user is not a coach
                resolve(true);
                return;
              }
            }
            console.log('Route guard unauthorised - no coach billing plan!');
            this.router.navigate(['dashboard']);
            this.alertService.alert('info-message', 'Just a Second!', `You need a Lifecoach plan to access this area. Please complete your payment to get access...`);
            resolve(false);
          });
      });
    } else {
      return new Promise(resolve => {
        resolve(true);
      });
    }
  }
}
