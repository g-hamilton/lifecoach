import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-coach-services',
  templateUrl: 'coach.services.component.html',
  styleUrls: ['./coach.services.component.scss']
})
export class CoachServicesComponent implements OnInit {

  public browser: boolean;
  private userId: string;
  public publishedServices: CoachingService[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUserData();
    }

  }

  getUserData() {
    this.authService.getAuthUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.dataService.getCoachServices(this.userId).subscribe(services => {
          if (services) {
            this.publishedServices = services;
          }
        });
      }
    });
  }

  onAddCoachingService() {
    //
  }

}
