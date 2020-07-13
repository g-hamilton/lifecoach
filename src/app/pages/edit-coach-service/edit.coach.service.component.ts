import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-coach-service',
  templateUrl: 'edit.coach.service.component.html'
})
export class EditCoachServiceComponent implements OnInit {

  public browser: boolean;
  public isNewService: boolean;
  public service: CoachingService;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;

      if (this.router.url.includes('new')) {
        this.isNewService = true;
      } else {
        this.route.params.subscribe(p => {
          if (p.id) {
            console.log(p.id);
          }
        });
      }
    }

  }

}
