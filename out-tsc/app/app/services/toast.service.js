var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
let ToastService = class ToastService {
    constructor(toastr) {
        this.toastr = toastr;
    }
    showToast(msg, time, 
    // tslint:disable-next-line: align
    toastStyle, 
    // tslint:disable-next-line: align
    vPos, hPos) {
        /*
          Pop a toast!
          Shows a toast with the given message passed as an arg.
          If a time is passed as an arg, it will set the timeOut on the notification.
          If no time is passed, the toast will default to timeOut after 5 secs.
          A style can be passed as an arg to set the css style of the toast.
          Position can also be dynamically set if required but defaults to bottom centre of view.
          Note: message can include html.
        */
        const from = vPos ? vPos : 'bottom';
        const align = hPos ? hPos : 'center';
        this.toastr.show(msg, '', {
            timeOut: time ? time : 5000,
            closeButton: true,
            enableHtml: true,
            toastClass: `alert alert-${toastStyle ? toastStyle : 'info'}`,
            positionClass: 'toast-' + from + '-' + align
        });
    }
};
ToastService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [ToastrService])
], ToastService);
export { ToastService };
//# sourceMappingURL=toast.service.js.map