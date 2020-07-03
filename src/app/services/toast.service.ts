import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  showToast(msg: string, time?: number,
    // tslint:disable-next-line: align
    toastStyle?: 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark',
    // tslint:disable-next-line: align
    vPos?: 'top' | 'bottom', hPos?: 'left' | 'center' | 'right') {

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
      positionClass: 'toast-' + from + '-' +  align
    });
  }

}
