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
  public me: CRMPerson;
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
          this.getCoachProfile();
          this.getHistory();
        }
      })
    );
  }

  getCoachProfile() {
    if (!this.coachId) {
      return;
    }
    this.subscriptions.add(
      this.dataService.getPublicCoachProfile(this.coachId).subscribe(profile => {
        if (profile) {
          this.coachProfile = profile;
        }
      })
    );
  }

  getHistory() {
    if (!this.coachId) {
      return;
    }
    this.subscriptions.add(
      this.crmPeopleService.getOwnClientHistory(this.userId, this.coachId).subscribe(data => {
        if (data) {
          console.log(data);

          // work out which coach created eCourses, programs & services this person has enrolled in by looking at their history array

          // deal with services
          const services = data.filter(i => i.action === 'service_purchase');
          const serviceIds = services.map(i => i.serviceId); // make an array of service ids (may contain duplicates!)
          const uniqueServiceIds = [...new Set(serviceIds)]; // remove any duplicates
          this.enrolledInServices = []; // reset
          uniqueServiceIds.forEach(i => this.loadService(i));

          // deal with programs
          const programs = data.filter(i => i.action === 'enrolled_in_program_session' || i.action === 'enrolled_in_full_program');
          const programIds = programs.map(i => i.programId); // make an array of program ids (may contain duplicates if paying per session!)
          const uniqueProgramIds = [...new Set(programIds)]; // remove any duplicates
          this.enrolledInPrograms = []; // reset
          uniqueProgramIds.forEach(i => this.loadProgram(i));

          // deal with eCourses
          const courses = data.filter(i => i.action === 'enrolled_in_self_study_course');
          const courseIds = courses.map(i => i.courseId); // make an array of course ids
          const uniqueCourseIds = [...new Set(courseIds)]; // remove any duplicates (there shouldn't be any)
          this.enrolledInCourses = []; // reset
          uniqueCourseIds.forEach(i => this.loadCourse(i));
        }
      })
    );
  }

  loadService(serviceId: string) {
    // fetch the service and push it to the array of services the person is enrolled in
    this.subscriptions.add(
      this.dataService.getPublicService(serviceId)
      .pipe(take(1))
      .subscribe(service => {
        if (service) {
          // check purchased & complete sessions
          this.subscriptions.add(
            this.dataService.getPurchasedServiceSessions(this.coachId, this.userId, serviceId)
            .pipe(take(1))
            .subscribe(sessions => {
              this.subscriptions.add(
                this.dataService.getServiceSessionsComplete(this.coachId, this.userId, serviceId)
                .pipe(take(1))
                .subscribe(complete => {
                  let purchasedSessions = [];
                  let sessionsComplete = [];
                  if (sessions) {
                    purchasedSessions = sessions;
                    service.purchasedSessions = sessions;
                  }
                  if (complete) {
                    sessionsComplete = complete;
                    service.sessionsComplete = complete;
                  }
                })
              );
            })
          );
          // add the program to the array
          this.enrolledInServices.push(service);
          console.log('enrolled in services:', this.enrolledInServices);
        }
      })
    );
  }

  loadProgram(programId: string) {
    // fetch the program and push it to the array of programs the person is enrolled in
    this.subscriptions.add(
      this.dataService.getPublicProgram(programId)
      .pipe(take(1))
      .subscribe(program => {
        if (program) {
          // calculate program progress
          this.subscriptions.add(
            this.dataService.getPurchasedProgramSessions(this.coachId, this.userId, programId)
            .pipe(take(1))
            .subscribe(sessions => {
              this.subscriptions.add(
                this.dataService.getProgramSessionsComplete(this.coachId, this.userId, programId)
                .pipe(take(1))
                .subscribe(complete => {
                  let purchasedSessions = [];
                  let sessionsComplete = [];
                  if (sessions) {
                    purchasedSessions = sessions;
                    program.purchasedSessions = sessions;
                  }
                  if (complete) {
                    sessionsComplete = complete;
                    program.sessionsComplete = complete;
                  }
                  const pc = (sessionsComplete.length / purchasedSessions.length) * 100;
                  program.progress = pc ? Number(pc.toFixed()) : 0;
                })
              );
            })
          );
          // add the program to the array
          this.enrolledInPrograms.push(program);
          console.log('enrolled in programs:', this.enrolledInPrograms);
        }
      })
    );
  }

  loadCourse(courseId: string) {
    // fetch the course and push it to the array of courses the person is enrolled in
    this.subscriptions.add(
      this.dataService.getPublicCourse(courseId)
      .pipe(take(1))
      .subscribe(course => {
        if (course) {
          // calculate course progress
          this.subscriptions.add(
            this.dataService.getPrivateCourseLecturesComplete(this.userId, course.courseId)
            .pipe(take(1))
            .subscribe(completedLectures => {
              const lecturesComplete = completedLectures.map(i => i.id);
              const pc = (lecturesComplete.length / course.lectures.length) * 100;
              course.progress = pc ? Number(pc.toFixed()) : 0;
            })
          );
          // add the course to the array
          this.enrolledInCourses.push(course);
          console.log('enrolled in courses:', this.enrolledInCourses);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
