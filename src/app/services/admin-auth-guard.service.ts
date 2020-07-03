import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuardService implements CanActivate {

  user: firebase.User;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.authService.getAuthUser()
      .subscribe( async user => {
        if (!user && isPlatformBrowser(this.platformId)) {
          this.router.navigate(['login']);
          resolve(false);
        }
        if (user) {
            const tokenRes = await user.getIdTokenResult();
            if (tokenRes.claims.admin) {
                resolve(true);
            }
        }
        resolve(false);
      });
    });
  }

}
