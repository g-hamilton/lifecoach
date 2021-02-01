import { Component, Inject, OnInit, PLATFORM_ID, Input, ViewChild, OnDestroy } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
import { ModalDirective, BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { LoginComponent } from 'app/components/login/login.component';

const misc: any = {
  sidebar_mini_active: true
};

@Component({
  selector: 'app-auth-course-navbar',
  templateUrl: './auth-course-navbar.component.html',
  styleUrls: ['./auth-course-navbar.component.scss']
})
export class AuthCourseNavbarComponent implements OnInit, OnDestroy {

  @ViewChild('reviewModal', {static: false}) public reviewModal: ModalDirective;

  @Input() course: CoachingCourse;
  @Input() lecturesComplete: string[];

  public bsModalRef: BsModalRef;

  public userId: string;
  public isCollapsed = true;
  private listTitles: any[];
  private location: Location;
  public userAuthorised = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    location: Location,
    public toastr: ToastrService,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private alertService: AlertService,
    private modalService: BsModalService
  ) {
    this.location = location;
    // Monitor the user's auth state
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          // Auth state is not null. User is authorised.
          this.userId = user.uid;
          this.userAuthorised = true;
        } else {
          // User is not authorised.
          this.userAuthorised = false;
        }
      })
    );
  }

  minimizeSidebar() {
    const body = this.document.getElementsByTagName('body')[0];
    if (body.classList.contains('sidebar-mini')) {
      misc.sidebar_mini_active = true;
    } else {
      misc.sidebar_mini_active = false;
    }
    if (misc.sidebar_mini_active === true) {
      body.classList.remove('sidebar-mini');
      misc.sidebar_mini_active = false;
      this.showSidebarMessage('Sidebar mini deactivated...');
    } else {
      body.classList.add('sidebar-mini');
      this.showSidebarMessage('Sidebar mini activated...');
      misc.sidebar_mini_active = true;
    }

    if (isPlatformBrowser(this.platformId)) {
      // we simulate the window Resize so the charts will get updated in realtime.
      const simulateWindowResize = setInterval(() => {
        window.dispatchEvent(new Event('resize'));
      }, 180);

      // we stop the simulation of Window Resize after the animations are completed
      setTimeout(() => {
        clearInterval(simulateWindowResize);
      }, 1000);
    }
  }

  showSidebarMessage(message) {
    this.toastr.show(
      '<span data-notify="icon" class="tim-icons icon-bell-55"></span>',
      message,
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      }
    );
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.split('/')[2];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.listTitles.length; i++) {
      if (this.listTitles[i].type === 'sub') {
        // tslint:disable-next-line: prefer-for-of
        for (let j = 0; j < this.listTitles[i].children.length; j++) {
          if (this.listTitles[i].children[j].path === titlee) {
            return this.listTitles[i].children[j].title;
          }
        }
      }
    }

    return 'Lifecoach';
  }

  getCourseProgress() {
    if (this.lecturesComplete && this.course) {
      const pc = (this.lecturesComplete.length / this.course.lectures.length) * 100;
      return pc ? pc.toFixed() : 0;
    }
  }

  onReviewSavedEvent() {
    this.reviewModal.hide();

    this.alertService.alert('success-message', 'Success!', `Thanks for leaving feedback! You can update your feedback at any time.`);
  }

  login() {
    // pop login modal
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        message: null,
        successMessage: null,
        redirectUrl: ['/dashboard']
      } as any
    };
    this.bsModalRef = this.modalService.show(LoginComponent, config);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
