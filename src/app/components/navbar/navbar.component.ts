import { Component, OnInit, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DataService } from '../../services/data.service';

import { CoachProfile } from '../../interfaces/coach.profile.interface';
import { Subscription } from 'rxjs';

const misc: any = {
  sidebar_mini_active: true
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public userProfile: CoachProfile;

  private listTitles: any[];
  location: Location;

  private toggleButton: any;
  public isCollapsed = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    public toastr: ToastrService,
    private authService: AuthService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.location = location;
    this.monitorUserProfile();
  }

  monitorUserProfile() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.dataService.getCoachProfile(user.uid)
              .subscribe(profile => {
                if (profile) {
                  this.userProfile = profile;
                }
              });
          }
        })
    );
  }

  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  updateColor = () => {
    if (isPlatformBrowser(this.platformId)) {
      const navbar = this.document.getElementsByClassName('navbar')[0];
      if (window.innerWidth < 993 && !this.isCollapsed) {
        navbar.classList.add('bg-white');
        navbar.classList.remove('navbar-transparent');
      } else {
        navbar.classList.remove('bg-white');
        navbar.classList.add('navbar-transparent');
      }
    }
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
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.updateColor);
    }
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this.router.events.subscribe(event => {
      this.sidebarClose();
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.updateColor);
    }
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    // tslint:disable-next-line: prefer-for-of
    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = (
      this.document.getElementsByTagName('body')[0]
    ) as HTMLElement;
    const html = this.document.getElementsByTagName('html')[0];

    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth < 991) {
        body.style.position = 'fixed';
      }

      setTimeout(() => {
        toggleButton.classList.add('toggled');
      }, 500);
    }

    html.classList.add('nav-open');
    const $layer = this.document.createElement('div');
    $layer.setAttribute('id', 'bodyClick');


    if (html.getElementsByTagName('body')) {
      this.document.getElementsByTagName('body')[0].appendChild($layer);
    }
    const $toggle = this.document.getElementsByClassName('navbar-toggler')[0];
    // tslint:disable-next-line: only-arrow-functions
    $layer.onclick = function () { // asign a function
      html.classList.remove('nav-open');
      setTimeout(() => {
        $layer.remove();
        $toggle.classList.remove('toggled');
      }, 400);
      const mainPanel = this.document.getElementsByClassName('main-panel')[0] as HTMLElement;

      if (isPlatformBrowser(this.platformId)) {
        if (window.innerWidth < 991) {
          setTimeout(() => {
            mainPanel.style.position = '';
          }, 500);
        }
      }
    }.bind(this);

    html.classList.add('nav-open');
  }

  sidebarClose() {
    const html = this.document.getElementsByTagName('html')[0];
    this.toggleButton.classList.remove('toggled');
    const body = (
      this.document.getElementsByTagName('body')[0]
    ) as HTMLElement;

    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth < 991) {
        setTimeout(() => {
          body.style.position = '';
        }, 500);
      }
    }
    const $layer: any = this.document.getElementById('bodyClick');
    if ($layer) {
      $layer.remove();

    }
    html.classList.remove('nav-open');
  }

  async logout() {
    await this.authService.signOut();
    console.log('Sign out successful.');
    this.alertService.alert('auto-close', 'Sign-Out Successful', 'See you again soon');
    this.router.navigate(['/']);
    this.analyticsService.signOut();
  }


}
