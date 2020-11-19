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
import { ROUTES } from '../sidebar/sidebar.component';
import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
const misc = {
    sidebar_mini_active: true
};
let AuthNavbarComponent = class AuthNavbarComponent {
    constructor(location, toastr, authService, document, platformId) {
        this.toastr = toastr;
        this.authService = authService;
        this.document = document;
        this.platformId = platformId;
        this.isCollapsed = true;
        this.userAuthorised = false;
        this.subscriptions = new Subscription();
        this.location = location;
        // Monitor the user's auth state
        this.subscriptions.add(this.authService.getAuthUser().subscribe(user => {
            if (user) {
                // Auth state is not null. User is authorised.
                this.userAuthorised = true;
            }
            else {
                // User is not authorised.
                this.userAuthorised = false;
            }
        }));
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
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
};
AuthNavbarComponent = __decorate([
    Component({
        selector: 'app-auth-navbar',
        templateUrl: './auth-navbar.component.html',
        styleUrls: ['./auth-navbar.component.scss']
    }),
    __param(3, Inject(DOCUMENT)),
    __param(4, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Location,
        ToastrService,
        AuthService, Object, Object])
], AuthNavbarComponent);
export { AuthNavbarComponent };
//# sourceMappingURL=auth-navbar.component.js.map