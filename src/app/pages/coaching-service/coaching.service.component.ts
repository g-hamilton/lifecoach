import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'coaching.service.component.html'
})
export class CoachingServiceComponent implements OnInit {

  public browser: boolean;
  public loading: boolean;
  private serviceId: string;
  public service: CoachingService;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
    }

    this.getRouteData();

  }

  getRouteData() {
    this.route.params.subscribe(p => {
      if (p.serviceId) {
        this.serviceId = p.serviceId;
        this.getServiceData();
      }
    });
  }

  getServiceData() {
    this.loading = true;
    this.dataService.getPublicService(this.serviceId).pipe(first()).subscribe(service => {
      if (service) {
        this.service = service;
        console.log(this.service);
      }
      this.loading = false;
    });
  }

}
