import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';
import { AuthService } from 'app/services/auth.service';
import { DataService } from 'app/services/data.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

/*
  This component is designed to be a re-usable modal.
  Allows users to schedule calls with coaches on available coach calendar slots
*/

@Component({
  selector: 'app-schedule-call',
  templateUrl: './schedule-call.component.html',
  styleUrls: ['./schedule-call.component.scss']
})
export class ScheduleCallComponent implements OnInit {

  // modal config
  public coachId: string; // pass the coach ID in through the modalOptions

  // component
  public browser: boolean;
  public userId: string;
  private subscriptions: Subscription = new Subscription();
  public dayToSelect: Array<Date> = [];
  public timeToSelect: Array<Date> = [];
  public availableEvents: CustomCalendarEvent[] | [];
  public todayEvents: Array<any>;

  // ngx datePicker
  public bsInlineValue = new Date();
  public dateSelectConfig = {
    datesEnabled: [
      new Date('2020-12-24'),
      new Date('2020-12-25'),
      new Date('2020-12-26'),
    ]
  } as BsDatepickerConfig;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public bsModalRef: BsModalRef,
    private dataService: DataService,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUser();
    }
  }

  getUser() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.getCoachCalendarEvents();
          }
        }, error => console.log('error logger', error.message))
    );
  }

  getCoachCalendarEvents() {
    this.subscriptions.add(
      this.dataService.getUserNotReservedEvents(this.coachId).subscribe(next => {
        console.log(next);
        if (next) {
          this.availableEvents = next;
          console.log(next);
          this.dayToSelect = [];
          this.availableEvents.forEach( i => {
            // @ts-ignore
            const startDate = new Date(i.start.seconds * 1000);
            const day = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
            if (!this.dayToSelect.some( (date) => this.isSameDay(date, day))) {
              this.dayToSelect.push(day);
            }
          });
          }
        console.log('UNIQUE DAYS:', this.dayToSelect);
      },
        error => console.log('error logger', error.message))
    );
  }

  daySelect(event: any) {
    if (event.target.value !== 'NULL') {
      console.log(event.target.value);
      this.subscriptions.add(
        this.dataService.getUserNotReservedEvents(this.coachId, new Date(event.target.value))
          .subscribe(next => {
          this.todayEvents = next;
        })
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
