import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fixed-plugin',
  templateUrl: './fixed-plugin.component.html',
  styleUrls: ['./fixed-plugin.component.scss']
})
export class FixedPluginComponent implements OnInit {

  public sidebarColor = 'red';
  public state = true;
  public dashboardColor = true;

  constructor(
    public toastr: ToastrService,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  changeSidebarColor(color: string) {
    const sidebar = this.document.getElementsByClassName('sidebar')[0];
    const mainPanel = this.document.getElementsByClassName('main-panel')[0];

    this.sidebarColor = color;

    if (sidebar !== undefined) {
      sidebar.setAttribute('data', color);
    }
    if (mainPanel !== undefined) {
      mainPanel.setAttribute('data', color);
    }
    // Todo: save pref to DB
  }

  changeDashboardColor(color: string) {
    const body = this.document.getElementsByTagName('body')[0];
    if (body && color === 'white-content') {
      body.classList.add(color);
    } else if (body.classList.contains('white-content')) {
      body.classList.remove('white-content');
    }
  }

  ngOnInit() {
    this.changeSidebarColor('primary'); // <-- Todo check DB for saved pref
  }

  onChangeDashboardColor(event: any) {
    const body = this.document.getElementsByTagName('body')[0];
    if (this.dashboardColor === true) {
      this.changeDashboardColor('');
    } else {
      this.changeDashboardColor('white-content');
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

  onChange(event: any) {
    const body = this.document.getElementsByTagName('body')[0];
    if (this.state === true) {
      body.classList.remove('sidebar-mini');
      this.showSidebarMessage('Sidebar mini deactivated...');
    } else {
      body.classList.add('sidebar-mini');
      this.showSidebarMessage('Sidebar mini activated...');
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
      '<span class="now-ui-icons ui-1_bell-53"></span>',
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

}
