import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { DataService } from 'app/services/data.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';

@Component({
  selector: 'app-admin-manage-user',
  templateUrl: './admin-manage-user.component.html',
  styleUrls: ['./admin-manage-user.component.scss']
})
export class AdminManageUserComponent implements OnInit, OnDestroy {

  @ViewChild('changeAccountTypeModal', {static: false}) public changeAccountTypeModal: ModalDirective;

  public browser: boolean;
  public targetUserUid: string;
  public account: UserAccount;
  public accountType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin';
  public newAccountType: 'regular' | 'coach' | 'partner' | 'provider' | 'admin'; // for admin update of type
  public purchasedCourses = [] as CoachingCourse[]; // purchased courses as buyer
  public purchasedPrograms = [] as CoachingProgram[]; // purchased programs as buyer
  public purchasedServices = [] as CoachingService[]; // purchased services as buyer
  public courses: CoachingCourse[]; // courses created as coach
  public programs: CoachingProgram[]; // programs created as coach
  public services: CoachingService[]; // services created as coach
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private alertService: AlertService,
    private cloudFunctionsService: CloudFunctionsService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.monitorRoute();
    }
  }

  monitorRoute() {
    this.route.params.subscribe(params => {
      if (params.targetUserUid) {
        this.targetUserUid = params.targetUserUid;
        console.log('Target user UID:', this.targetUserUid);
      }
      console.log('Loading user data...');
      this.loadUserData();
    });
  }

  loadUserData() {
    if (this.targetUserUid) {
      // Check user type
      this.subscriptions.add(
        this.dataService.getUserAccount(this.targetUserUid).subscribe(account => {
          if (account) {
            this.account = account;
            this.accountType = account.accountType;
            this.newAccountType = account.accountType; // make a copy to allow update while preserving old data

            if (this.accountType === 'coach') { // because only coaches can publish courses
              this.loadCoachCourses();
              this.loadCoachPrograms();
              this.loadCoachServices();
            }

            this.loadPurchasedCourses();
            this.loadPurchasedPrograms();
          }
        })
      );
    }
  }

  loadCoachCourses() {
    // Check for created courses (as coach seller)
    this.subscriptions.add(
      this.dataService.getPrivateCourses(this.targetUserUid).subscribe(courses => {
        if (courses) {
          this.courses = courses;
          // console.log('Courses:', courses);
        }
      })
    );
  }

  loadCoachPrograms() {
    // Check for created programs (as coach seller)
    this.subscriptions.add(
      this.dataService.getPrivatePrograms(this.targetUserUid).subscribe(programs => {
        if (programs) {
          this.programs = programs;
          // console.log('Programs:', programs);
        }
      })
    );
  }

  loadCoachServices() {
    // Check for created services (as coach seller)
    this.subscriptions.add(
      this.dataService.getPrivateServices(this.targetUserUid).subscribe(services => {
        if (services) {
          this.services = services;
          // console.log('Services:', services);
        }
      })
    );
  }

  loadPurchasedCourses() {
    // Check for purchased courses. Coaches and regular users can purchase courses
    this.subscriptions.add(
      this.dataService.getPurchasedCourses(this.targetUserUid).subscribe(courseIds => {
        if (courseIds) {
          // console.log('Purchased Course Ids:', courseIds);
          this.purchasedCourses = []; // reset
          courseIds.forEach((o: any, index) => { // fetch and monitor live / latest course info
            this.subscriptions.add(
              this.dataService.getPublicCourse(o.id).subscribe(course => {
                if (course) {
                  this.purchasedCourses.push(course);
                  this.calcCourseProgress(course, index);
                }
              })
            );
          });
        }
      })
    );
  }

  loadPurchasedPrograms() {
    // Check for purchased programs. Coaches and regular users can purchase programs
    this.subscriptions.add(
      this.dataService.getPurchasedPrograms(this.targetUserUid).subscribe(programIds => {
        if (programIds) {
          // console.log('Purchased Program Ids:', programIds);
          this.purchasedPrograms = []; // reset
          programIds.forEach((o: any, index) => { // fetch and monitor live / latest program info
            this.subscriptions.add(
              this.dataService.getPublicProgram(o.id).subscribe(program => {
                if (program) {
                  this.purchasedPrograms.push(program);
                }
              })
            );
          });
        }
      })
    );
  }

  loadPurchasedServices() {
    // Check for purchased services. Coaches and regular users can purchase services
    this.subscriptions.add(
      this.dataService.getPurchasedServices(this.targetUserUid).subscribe(serviceIds => {
        if (serviceIds) {
          // console.log('Purchased Service Ids:', serviceIds);
          this.purchasedServices = []; // reset
          serviceIds.forEach((o: any, index) => { // fetch and monitor live / latest service info
            this.subscriptions.add(
              this.dataService.getPublicService(o.id).subscribe(service => {
                if (service) {
                  this.purchasedServices.push(service);
                }
              })
            );
          });
        }
      })
    );
  }

  calcCourseProgress(course: CoachingCourse, index: number) {
    this.subscriptions.add(
      this.dataService.getPrivateCourseLecturesComplete(this.targetUserUid, course.courseId).subscribe(completedLectures => {
        const lecturesComplete = completedLectures.map(i => i.id);
        const pc = (lecturesComplete.length / course.lectures.length) * 100;
        this.purchasedCourses[index].progress = pc ? Number(pc.toFixed()) : 0;
      })
    );
  }

  viewPublicUserProfile() {
    this.router.navigate(['/coach', this.targetUserUid]);
  }

  editUserProfile() {
    this.router.navigate(['/admin-edit-user-profile', this.targetUserUid]);
  }

  async createUserCourse() {
    if (!this.account.stripeUid) { // alert if no stripe account for info
      this.alertService.alert('info-message', 'Be Aware!', `This user has no Stripe account.`);
    }
    this.router.navigate(['my-courses', 'new-course'], {queryParams: {targetUser: this.targetUserUid}});
  }

  viewUserCourse(courseId: string) {
    //
  }

  editUserCourse(courseId: string) {
    this.router.navigate(['/my-courses', courseId, 'content'], {queryParams: {targetUser: this.targetUserUid}});
  }

  async createUserProgram() {
    if (!this.account.stripeUid) { // alert if no stripe account for info
      this.alertService.alert('info-message', 'Be Aware!', `This user has no Stripe account.`);
    }
    this.router.navigate(['my-programs', 'new-program'], {queryParams: {targetUser: this.targetUserUid}});
  }

  editUserProgram(programId: string) {
    this.router.navigate(['/my-programs', programId, 'content'], {queryParams: {targetUser: this.targetUserUid}});
  }

  async createUserService() {
    if (!this.account.stripeUid) { // alert if no stripe account for info
      this.alertService.alert('info-message', 'Be Aware!', `This user has no Stripe account.`);
    }
    this.router.navigate(['my-services', 'new-service'], {queryParams: {targetUser: this.targetUserUid}});
  }

  editUserService(serviceId: string) {
    this.router.navigate(['/my-services', serviceId, 'content'], {queryParams: {targetUser: this.targetUserUid}});
  }

  async saveUpdatedAccountType() {
    if (!this.targetUserUid) {
      this.alertService.alert('warning-message', 'Oops', 'Missing user ID.');
      return;
    }
    if (!this.accountType) {
      this.alertService.alert('warning-message', 'Oops', 'Missing account type.');
      return;
    }
    if (!this.newAccountType) {
      this.alertService.alert('warning-message', 'Oops', 'You must select an account type.');
      return;
    }
    console.log(`Updating user account type from ${this.accountType} to ${this.newAccountType}`);
    const res = await this.cloudFunctionsService.adminChangeUserType(this.targetUserUid, this.accountType, this.newAccountType);
    this.changeAccountTypeModal.hide();
  }

  async adminDeleteStripeExpressAccount() {
    if (!this.account.stripeUid) {
      alert('Missing Stripe Express account ID');
      return;
    }
    const data = { stripeUid: this.account.stripeUid, uid: this.targetUserUid };
    const res = await this.cloudFunctionsService.deleteStripeConnectedExpressAccount(data) as any;
    console.log('Result:', res);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
