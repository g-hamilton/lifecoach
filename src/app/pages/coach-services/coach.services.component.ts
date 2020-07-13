import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'coach.services.component.html',
  styleUrls: ['./coach.services.component.scss']
})
export class CoachServicesComponent implements OnInit {

  public browser: boolean;

  public publishedServices: CoachingService[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
        this.browser = true;
    }

  }

  onAddCoachingService() {
    //
  }

}
