import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CalendarView} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CustomCalendarEvent} from '../../interfaces/custom.calendar.event.interface';
import {DataService} from 'app/services/data.service';
import {AuthService} from 'app/services/auth.service';
import {take} from 'rxjs/operators';
import {ToastrService} from "ngx-toastr";
import {AlertService} from "../../services/alert.service";

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-calendar',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './calendar.component.html',
})

export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('eventDetailModal', {static: false}) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', {static: false}) public editEventModal: ModalDirective;
  @ViewChild('cancelEventModal', {static: false}) public cancelEventModal: ModalDirective;

  private userId: string;

  public view: CalendarView = CalendarView.Week;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CustomCalendarEvent;
  public activeEventForm: FormGroup;
  public savingEvent: boolean;

  public events: CustomCalendarEvent[];

  sessionDuration = 30;
  breakDuration = 15;
  endTimes: Date[] | [];
  startTimes: Date[] | [];
  // video conferencing
  private meetingDomain = 'live.lifecoach.io';
  private meetingOptions: any;
  private meetingApi: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private toastService: ToastrService,
    public alertService: AlertService
  ) {
  }

  ngOnInit() {
    this.buildActiveEventForm();
    this.loadUserData();
    this.endTimes = [];
    this.startTimes = [];
    console.log('View', this.viewDate);
  }

  ngAfterViewInit() {
    // this.initJitsiMeet();
  }

  initJitsiMeet() {
    // https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe

    this.meetingOptions = {
      roomName: 'nkbfjksbfksdbfjsbfksb',
      width: 700,
      height: 700,
      parentNode: document.querySelector('#meet'),
      // interfaceConfigOverwrite: {
      //   APP_NAME: 'Lifecoach',
      //   NATIVE_APP_NAME: 'Lifecoach',
      //   SHOW_JITSI_WATERMARK: false,
      //   SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      //   BRAND_WATERMARK_LINK: 'https://lifecoach.io',
      //   DEFAULT_LOGO_URL: 'https://lifecoach.io/assets/img/lifecoach-logo-dark-monotone.svg',
      //   AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
      //   AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',
      //   MOBILE_APP_PROMO: false,
      // },
    };
    this.meetingApi = new JitsiMeetExternalAPI(this.meetingDomain, this.meetingOptions);
  }

  buildActiveEventForm() {
    this.activeEventForm = this.formBuilder.group(
      {
        id: [null],
        title: [null],
        start: [null],
        end: [null],
        draggable: [null],
        cssClass: [null],
        description: [null]
      }
    );
  }

  get activeEventF(): any {
    return this.activeEventForm.controls;
  }

  loadUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.userId = user.uid;
          this.subscriptions.add(
            this.dataService.getUserAccount(this.userId).pipe(take(1)).subscribe(userAccount => {
                this.sessionDuration = userAccount.sessionDuration ? userAccount.sessionDuration : 30;
                this.breakDuration = userAccount.breakDuration ? userAccount.breakDuration : 15;
              }
            )
          );

          this.subscriptions.add(
            this.dataService.getUserCalendarEvents(this.userId, this.viewDate).subscribe(events => {
              if (events) {
                console.log('events before forEach', events);
                // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
                events.forEach((ev: any) => {
                  if (ev.start) {
                    ev.start = new Date(ev.start.seconds * 1000);
                  }
                  if (ev.end) {
                    ev.end = new Date(ev.end.seconds * 1000);
                  }
                  ev.title = ev.reserved ? (ev.ordered ? 'ORDERED' : 'RESERVED') : 'FREE';
                  ev.cssClass = ev.reserved ? (ev.ordered ? 'ordered' : 'reserved') : 'free' ;
                });

                this.events = events;
                this.refresh.next(); // refresh the view

                // console.log(this.events);
              }
            })
          );

        }
      })
    );
  }

  loadActiveEventFormData() {
    this.activeEventForm.patchValue({
      id: this.activeEvent.id ? this.activeEvent.id : null,
      start: this.activeEvent.start ? this.activeEvent.start : null,
      end: this.activeEvent.end ? this.activeEvent.end : null,
      // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      description: this.activeEvent.description ? this.activeEvent.description : null,
      reserved: this.activeEvent.reserved ? this.activeEvent.reserved : false,
      reservedById: this.activeEvent.reservedById ? this.activeEvent.reservedById : null,
      ordered: this.activeEvent.ordered ? this.activeEvent.ordered : null,
      orderedById: this.activeEvent.orderedById ? this.activeEvent.orderedById : null,
      cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
    });
  }

  onColumnClicked(event: any) {
    // console.log('clicked column:', event.isoDayNumber);
  }

  onDayClicked(event: any) {
    // console.log('clicked day:', event.day.date);
    // this.createEvent(event.day.date);
  }

  onDayHeaderClicked(event: any) {
    // console.log('clicked day header:', event.day.date);
    // this.createEvent(event.day.date);
  }
  onHourSegmentClicked(event: any) {
    // if (event.date < new Date(Date.now() + 60000 * 30) ) { // 30 minutes for planning event
    //   alert('You can`t pick date, which has already been'); // TODO: Modal
    //   return;
    // }
    this.createEvent(event.date);
    this.fillEndTimes(event);
    this.fillStartTimes(event);
  }
  toTimeStampFromStr(strDate: string): number {
    return Date.parse(strDate) / 1000;
  }
  fillEndTimes(event: any, dontPop?: boolean ) {
    console.log('Event', event.date);
    let date: Date;
    if (event.date !== undefined && event.date.status === undefined) {
      date = event.date instanceof Date ? new Date(event.date) : new Date(this.toTimeStampFromStr(event.target.value) * 1000);
    } else {
      date = new Date(event.date.value);
    }
    let newTime: Date = date;
    console.group('test');
    // console.log('EndTimes before cleaning', this.endTimes);
    this.endTimes = [];
    while (newTime.getDate() === date.getDate()) {
      console.log('Date: ', date.getDate(), 'NewTime: ', newTime.getDate());
      newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
      this.endTimes = [...this.endTimes, newTime];
      newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.breakDuration));
    }
    this.endTimes.pop();
    // console.log('After Pop', this.endTimes);
    this.activeEventForm.patchValue({
      end: this.endTimes[0]
    });
    // console.log('In the End', this.endTimes);
    console.groupEnd();
  }
  createEvent(date: Date) {
    // console.log('Create event', date);

    // prepare a new event object
    const newEvent: CustomCalendarEvent = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random id
      title: 'New Event',
      start: date,
      end: date
    };

    // load the new event as the active event
    this.activeEvent = newEvent;
    this.loadActiveEventFormData();

    // pop the edit event modal
    this.editEventModal.show();
  }

  eventClicked({event}: { event: CustomCalendarEvent }): void {
    this.activeEvent = event;
    console.log(event);

    this.eventDetailModal.show();
    console.log('TEST, TEST, TEST', this.activeEventF);
  }

  onEventDetailModalClose() {
    this.eventDetailModal.hide();
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
      // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      cssClass:  null,
      description: null,
      reservedById: null,
      reserved: false,
      ordered: false,
      orderedById: null,
    });
    this.activeEvent = null;
  }

  onEditEventModalClose() {
    this.editEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.patchValue({
      id: null,
      start: null,
      end: null,
      // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
      draggable: false,
      cssClass:  null,
      description: null,
      reserved: false,
      reservedById: null,
    });
    this.activeEvent = null;
  }

  onEditEvent() {

    this.eventDetailModal.hide();
    console.log('275,', this.activeEvent);
    if (this.activeEvent.reserved) {
      alert(`Sorry, this event was already reserved by the user: ${this.activeEvent.reservedById}`);// TODO: Modal
      return;
    }
    // this.activeEvent = null;
    console.log('TEST, TEST, TEST', this.activeEventF);
    this.startTimes = [];
    this.endTimes = [];
    this.loadActiveEventFormData();
    this.fillStartTimes({date: this.activeEventF.start});
    this.fillEndTimes({ date: this.activeEventF.start}, true);

    this.editEventModal.show();
    // this.activeEventForm.patchValue({
    //   id: null,
    //   start: null,
    //   end: null,
    //   // title: this.activeEvent.start.toLocaleTimeString() + ' - ' + (this.activeEvent.end.toLocaleTimeString() || ' '),
    //   draggable: false,
    //   cssClass:  null,
    //   description: null
    // });
  }

  onDetailDeleteEvent() {
    this.eventDetailModal.hide();
    if (this.activeEvent.reserved) {
      alert(`Sorry, this event was already reserved by the user: ${this.activeEvent.reservedById}`); // TODO: Modal
      return;
    }
    this.cancelEventModal.show();
  }

  onEditDeleteEvent() {
    this.editEventModal.hide();
    this.cancelEventModal.show();
  }

  onCancelEventModalClose() {
    this.cancelEventModal.hide();
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  async onDeleteEvent(notifyOther: boolean) {

    console.log('Cancel event. Notify other(s):', notifyOther);
    // TODO could send notification emails / notifications now

    // delete the event
    await this.dataService.deleteUserCalendarEvent(this.userId, this.activeEvent.start);

    // dismiss the modal
    this.cancelEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }
  isTheSameDay(a: Date, b: Date): boolean {
    return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDay() === b.getDay());
  }

  divideEventIntoSessions(ob: CustomCalendarEvent): Array<CustomCalendarEvent> {
    console.log('divider', ob);
    const result: Array<CustomCalendarEvent> = [];
    const startTime = new Date(ob.start).getTime();
    const endTime = ob.end.getTime();
    console.log(ob.start, ob.end);
    if (endTime - startTime !== this.sessionDuration * 60000 + this.breakDuration * 60000) {
      let expireTime: number = startTime;
      console.log('Was divided');
      while (expireTime < endTime) {
        const ev = {
          ...ob,
          // title: `${new Date(expireTime).toLocaleTimeString()} - ${new Date(expireTime + this.sessionDuration * 60000).toLocaleTimeString()}`,
          title: ob.reservedById ? (ob.ordered ? 'Ordered' : 'reserved') : 'I am free',
          start: new Date(expireTime),
          end: new Date(expireTime + this.sessionDuration * 60000),
          id: Math.random().toString(36).substr(2, 9),
          reserved: false,
          reservedById: null,
          ordered: false,
          orderedById: null,
          cssClass: ob.reservedById ? (ob.ordered ? 'orderedSession' : 'reserved') : 'not',
        };
        console.log(ev);
        result.push(ev);
        expireTime += this.sessionDuration * 60000 + this.breakDuration * 60000;
      }
    } else {
      result.push({
        ...ob,
        title: ob.reservedById ? (ob.ordered ? 'Ordered' : 'reserved') : 'I am free',
        reserved: false,
        reservedById: null,
        ordered: false,
        orderedById: null,
        cssClass: ob.reservedById ? (ob.ordered ? 'orderedSession' : 'reserved') : 'not',
      });
    }
    return result;
  }
  onUpdateEvent() {
    this.savingEvent = true;
    // if the event has no id, create one id now

    if (!this.activeEventF.id.value) {
      this.activeEventForm.patchValue({id: Math.random().toString(36).substr(2, 9)}); // generate semi-random id
    }

    console.log(this.activeEventF);
    console.log('Events', this.events);

    const ev = this.activeEventForm.value;
    ev.start = new Date(ev.start);
    const thisDayEvents = this.events !== undefined ?
      this.events
        .filter( item => this.isTheSameDay(item.start, ev.start))
        : undefined;
    console.log(thisDayEvents);
    let error = false;
    if (thisDayEvents.length) {
      for (let i = 0; i < thisDayEvents.length; i++) {
        if ((this.toTimeStampFromStr(ev.start) <= this.toTimeStampFromStr(thisDayEvents[i].end.toString())
          && (this.toTimeStampFromStr(ev.start) >= this.toTimeStampFromStr(thisDayEvents[i].start.toString())))
          || (this.toTimeStampFromStr(ev.end) >= this.toTimeStampFromStr(thisDayEvents[i].start.toString()))
          && (this.toTimeStampFromStr(ev.end) <= this.toTimeStampFromStr(thisDayEvents[i].end.toString()))) {
          error = true;
        }

      }
    }
    if (error) {
      // TODO: It will be better to do a Modal with warning;
      // alert('Choose other date!'); // TODO: Modal
      this.alertService.alert(
          'warning-message',
        'Choose other time!',
          'Our apologize. System is working in test-mode. Please, choose time which will not across Your other free time events',
        'ok',
        'btn btn-round btn-success',
      ).then(()=>console.log('ended'));
      return;
    }
    // Make a divider there
    //
    // ev.title = `${ev.start.toLocaleTimeString()} - ${ev.end.toLocaleTimeString()}`;
    this.divideEventIntoSessions(ev)
      .forEach(i => {
        this.dataService.saveUserCalendarEvent(this.userId, i.start, i);
        this.eventNotification(ev);
      });
    console.log(ev);
    // save the event
    if (!this.userId) {
      alert('No user ID'); // TODO: Modal
      return;
    }
    // this.dataService.saveUserCalendarEvent(this.userId, ev.start, ev);

    // dismiss the modal
    this.editEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  eventNotification( ev: any ) {
    console.log(ev);
    this.toastService.show( '<span data-notify="icon" class="tim-icons icon-bell-55"></span>',
      `Your Calendar successfully updated.
      Added free time from ${ev.start.toLocaleString()} till ${ev.end.toLocaleString()}`,
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-danger alert-with-icon',
        positionClass: 'toast-top-right'
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onChangeStartTimeHandler(event: any) {
    console.log('Event', event,
      'Times changed', event.target.value );
    this.fillEndTimes({date: new Date(Date.parse(event.target.value))});

  }

  fillStartTimes(event: any) {
    this.startTimes = [];
    const oldTime: Date = event.date instanceof Date ? event.date : event.date.value ;
    let newTime = new Date(oldTime);
    this.startTimes = [...this.startTimes, oldTime];
    while ( true ) {
      newTime = new Date(newTime.setMinutes(newTime.getMinutes() + this.sessionDuration));
      if (newTime.getDay() !== oldTime.getDay()) {
        break;
      }
      this.startTimes =  [...this.startTimes, newTime ];
    }
    this.activeEventForm.patchValue({
      start: this.startTimes[0]
    });
  }
}
