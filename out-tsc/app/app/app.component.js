var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AnalyticsService } from './services/analytics.service';
let AppComponent = class AppComponent {
    constructor(authService, analytics) {
        this.authService = authService;
        this.analytics = analytics;
        this.userAuthorised = false;
        // Initialise analytics
        this.analytics.init();
        // Monitor the user's auth state
        // this.authService.getAuthUser().subscribe(user => {
        //   if (user) {
        //     console.log('User is authorised');
        //     // Auth state is not null. User is authorised.
        //     this.userAuthorised = true;
        //     // Check the user's custom auth claims.
        //     // user.getIdTokenResult()
        //     // .then(tokenRes => {
        //     //   console.log('Custom user claims:', tokenRes.claims);
        //     // });
        //   } else {
        //     // User is not authorised.
        //     console.log('User not authorised.');
        //     this.userAuthorised = false;
        //   }
        // });
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss']
    }),
    __metadata("design:paramtypes", [AuthService,
        AnalyticsService])
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map