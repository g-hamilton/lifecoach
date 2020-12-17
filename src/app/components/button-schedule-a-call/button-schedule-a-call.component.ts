import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {ModalDirective} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-button-schedule-a-call',
  templateUrl: './button-schedule-a-call.component.html',
  styleUrls: ['./button-schedule-a-call.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonScheduleACallComponent implements OnInit {

  @Input() disabled: boolean;
  @Input() coachId: string;
  @Input() userId: string;

  @ViewChild('schedulerModal', {static: false}) public schedulerModal: ModalDirective;



  public dayToSelect: Array<Date> = [];
  public todayEvents: Array<any>;

  private subscriptions: Subscription = new Subscription();
  constructor(
    private dataService: DataService,
    private toastrService: ToastrService,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log('alalalalalalal');
  }

  daySelect(event: any) {
    if (event.target.value !== 'NULL') {
      console.log(event.target.value);
      this.subscriptions.add(
        this.dataService.getUserNotReservedEvents(this.coachId, new Date(event.target.value))
          .subscribe(next => {
            this.todayEvents = next;
          }, error => console.log('error logger', error.message))
      );
    } else {
    }
  }
  isSameDay(a: Date, b: Date) {
    return (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate());
  }
  reserveSession($event: any) {
    this.dataService.reserveEvent(this.userId, this.coachId, $event.target.value).then( r => console.log('Reserved'));
    this.showNotification();
  }
  showNotification() {
    this.toastrService.success('<span data-notify="icon" class="tim-icons icon-bell-55"></span>You have 15 minutes for confirm Your reservation. Click here to redirect lifecoach.io/reserved.sessions',
      `You have successfully reserved event`,
      {
        timeOut: 8000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      }, )
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigate(['/reserved-sessions']));
  }

}
