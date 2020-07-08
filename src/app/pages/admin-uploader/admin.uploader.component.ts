import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'admin.uploader.component.html'
})
export class AdminUploaderComponent implements OnInit {

  public browser: boolean;
  public userId: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      });
    }

  }

}
