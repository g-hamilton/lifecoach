import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'admin.uploader.component.html'
})
export class AdminUploaderComponent implements OnInit {

  public browser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
        this.browser = true;
    }

  }

}
