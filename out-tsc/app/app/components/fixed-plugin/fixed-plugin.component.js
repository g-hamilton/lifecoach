var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
let FixedPluginComponent = class FixedPluginComponent {
    constructor(toastr, document, platformId) {
        this.toastr = toastr;
        this.document = document;
        this.platformId = platformId;
        this.sidebarColor = 'red';
        this.state = true;
        this.dashboardColor = true;
    }
    changeSidebarColor(color) {
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
    changeDashboardColor(color) {
        const body = this.document.getElementsByTagName('body')[0];
        if (body && color === 'white-content') {
            body.classList.add(color);
        }
        else if (body.classList.contains('white-content')) {
            body.classList.remove('white-content');
        }
    }
    ngOnInit() {
        this.changeSidebarColor('primary'); // <-- Todo check DB for saved pref
    }
    onChangeDashboardColor(event) {
        const body = this.document.getElementsByTagName('body')[0];
        if (this.dashboardColor === true) {
            this.changeDashboardColor('');
        }
        else {
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
    onChange(event) {
        const body = this.document.getElementsByTagName('body')[0];
        if (this.state === true) {
            body.classList.remove('sidebar-mini');
            this.showSidebarMessage('Sidebar mini deactivated...');
        }
        else {
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
        this.toastr.show('<span class="now-ui-icons ui-1_bell-53"></span>', message, {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: 'alert alert-danger alert-with-icon',
            positionClass: 'toast-top-right'
        });
    }
};
FixedPluginComponent = __decorate([
    Component({
        selector: 'app-fixed-plugin',
        templateUrl: './fixed-plugin.component.html',
        styleUrls: ['./fixed-plugin.component.scss']
    }),
    __param(1, Inject(DOCUMENT)),
    __param(2, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [ToastrService, Object, Object])
], FixedPluginComponent);
export { FixedPluginComponent };
//# sourceMappingURL=fixed-plugin.component.js.map