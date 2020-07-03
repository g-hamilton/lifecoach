import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-calendar-page',
  templateUrl: 'calendar.page.component.html',
  styleUrls: ['./calendar.page.component.scss']
})
export class CalendarPageComponent implements OnInit {

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
