import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class PaywallAuthGuardService implements CanActivate {

  user: firebase.User;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      return new Promise(resolve => {
        const cId = route.paramMap.get('courseId'); // retrieve the course ID we're trying to navigate to
        // console.log(cId);

        // Check if user authorised
        this.authService.getAuthUser()
          .subscribe(async user => {
            if (!user && isPlatformBrowser(this.platformId)) { // user unauthorised & browser
              console.log('Route guard unauthorised!');
              this.router.navigate(['login']);
              resolve(false);
              return;
            }
            if (user) { // user authorised

              // check user token for permissions
              const res = await user.getIdTokenResult(true);
              // console.log(res.claims);
              if (res.claims.admin || res.claims[cId]) { // user is admin or has purchased course
                console.log('User is authorised to continue...');
                resolve(true);
                return;
              }

              // check user created courses
              const tempSub = this.dataService.getPrivateCourses(user.uid).subscribe(courses => {
                if (courses) { // user has created courses
                  const match = courses.findIndex(i => i.courseId === cId);
                  if (match === -1) { // user has not created this course
                    alert('Unauthorised!');
                    console.log('Route guard unauthorised!');
                    tempSub.unsubscribe();
                    resolve(false);
                    return;
                  }
                  resolve(true); // user has created this course
                  return;
                } else { // user has no courses
                  alert('Unauthorised!');
                  console.log('Route guard unauthorised!');
                  tempSub.unsubscribe();
                  resolve(false);
                  return;
                }
              });
            }
          });
      });
    } else {
      return new Promise(resolve => {
        resolve(true);
      });
    }
  }

}
