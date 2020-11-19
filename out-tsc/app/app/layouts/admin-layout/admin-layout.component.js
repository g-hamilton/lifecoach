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
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import PerfectScrollbar from 'perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
const misc = {
    sidebar_mini_active: true
};
let AdminLayoutComponent = class AdminLayoutComponent {
    constructor(document, platformId, router, toastr, titleService, metaTagService, authService) {
        this.document = document;
        this.platformId = platformId;
        this.router = router;
        this.toastr = toastr;
        this.titleService = titleService;
        this.metaTagService = metaTagService;
        this.authService = authService;
        this.subscriptions = new Subscription();
        this.showNavbarButton = () => {
            const mainPanel = this.document.getElementsByClassName('main-panel')[0];
            const navbarMinimize = this.document.getElementsByClassName('navbar-minimize-fixed')[0];
            if (this.document.documentElement.scrollTop > 50 ||
                this.document.scrollingElement.scrollTop > 50 ||
                mainPanel.scrollTop > 50) {
                navbarMinimize.style.opacity = 1;
            }
            else if (this.document.documentElement.scrollTop <= 50 ||
                this.document.scrollingElement.scrollTop <= 50 ||
                mainPanel.scrollTop <= 50) {
                navbarMinimize.style.opacity = 0;
            }
        };
    }
    ngOnInit() {
        this.titleService.setTitle('Lifecoach');
        this.metaTagService.updateTag({ name: 'description', content: 'My Lifecoach Dashboard' });
        const mainPanel = this.document.getElementsByClassName('main-panel')[0];
        const sidebar = this.document.getElementsByClassName('sidebar-wrapper')[0];
        if (isPlatformBrowser(this.platformId)) {
            this.monitorUserAuth();
        }
        if (isPlatformBrowser(this.platformId) && navigator.platform.indexOf('Win') > -1) {
            this.document.documentElement.className += ' perfect-scrollbar-on';
            this.document.documentElement.classList.remove('perfect-scrollbar-off');
            let ps = new PerfectScrollbar(mainPanel);
            ps = new PerfectScrollbar(sidebar);
            const tables = this.document.querySelectorAll('.table-responsive');
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < tables.length; i++) {
                ps = new PerfectScrollbar(tables[i]);
            }
        }
        this.showNavbarButton();
    }
    minimizeSidebar() {
        const body = this.document.getElementsByTagName('body')[0];
        if (body.classList.contains('sidebar-mini')) {
            misc.sidebar_mini_active = true;
        }
        else {
            misc.sidebar_mini_active = false;
        }
        if (misc.sidebar_mini_active === true) {
            body.classList.remove('sidebar-mini');
            misc.sidebar_mini_active = false;
            this.showSidebarMessage('Sidebar mini deactivated...');
        }
        else {
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
        this.toastr.show('<span data-notify="icon" class="tim-icons icon-bell-55"></span>', message, {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: 'alert alert-danger alert-with-icon',
            positionClass: 'toast-top-right'
        });
    }
    monitorUserAuth() {
        // Monitor the user's auth state
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                // console.log('User is authorised');
                // Auth state is not null. User is authorised.
                this.userAuthorised = true;
                // Check the user's custom auth claims.
                user.getIdTokenResult()
                    .then(tokenRes => {
                    // console.log('Custom user claims:', tokenRes.claims);
                    this.userClaims = tokenRes.claims;
                });
            }
            else {
                // User is not authorised.
                // console.log('User not authorised.');
                this.userAuthorised = false;
            }
        }));
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
__decorate([
    HostListener('window:scroll', ['$event']),
    __metadata("design:type", Object)
], AdminLayoutComponent.prototype, "showNavbarButton", void 0);
AdminLayoutComponent = __decorate([
    Component({
        selector: 'app-admin-layout',
        templateUrl: './admin-layout.component.html',
        styleUrls: ['./admin-layout.component.scss']
    }),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, Object, Router,
        ToastrService,
        Title,
        Meta,
        AuthService])
], AdminLayoutComponent);
export { AdminLayoutComponent };
//# sourceMappingURL=admin-layout.component.js.map