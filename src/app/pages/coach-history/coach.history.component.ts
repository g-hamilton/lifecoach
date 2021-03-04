import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CrmPeopleService } from 'app/services/crm-people.service';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { DataService } from 'app/services/data.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';

@Component({
  selector: 'app-coach-history',
  templateUrl: 'coach.history.component.html'
})
export class CoachHistoryComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;

  public browser: boolean;
  private userId: string;
  private coachId: string;
  public coachProfile: CoachProfile;
  private subscriptions: Subscription = new Subscription();
  public msgUrl = '/messages';
  public enrolledInCourses = [] as CoachingCourse[];
  public enrolledInPrograms = [] as CoachingProgram[];
  public enrolledInServices = [] as CoachingService[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private crmPeopleService: CrmPeopleService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.route.params.subscribe(params => {
        if (params.coachId) {
          this.coachId = params.coachId;
          this.getUserData();
        }
      });
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
