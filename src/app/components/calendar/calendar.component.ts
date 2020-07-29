import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { Subject, Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomCalendarEvent } from '../../interfaces/custom.calendar.event.interface';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('eventDetailModal', {static: false}) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', {static: false}) public editEventModal: ModalDirective;
  @ViewChild('cancelEventModal', {static: false}) public cancelEventModal: ModalDirective;

  private userId: string;

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CustomCalendarEvent;
  public activeEventForm: FormGroup;
  public savingEvent: boolean;

  public events: CustomCalendarEvent[];

  // video conferencing
  private meetingDomain = 'live.lifecoach.io';
  private meetingOptions: any;
  private meetingApi: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    this.buildActiveEventForm();
    this.loadUserData();
  }

  ngAfterViewInit() {
    this.initJitsiMeet();
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
          this.userId = user.uid;
          this.subscriptions.add(
            this.dataService.getUserCalendarEvents(this.userId).subscribe(events => {
              if (events) {
                // important: update date objects as Firebase stores dates as unix string: 't {seconds: 0, nanoseconds: 0}'
                events.forEach((ev: any) => {
                  if (ev.start) {
                    ev.start = new Date(ev.start.seconds * 1000);
                  }
                  if (ev.end) {
                    ev.end = new Date(ev.end.seconds * 1000);
                  }
                });

                this.events = events;
                this.refresh.next(); // refresh the view

                console.log(this.events);
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
      title: this.activeEvent.title ? this.activeEvent.title : null,
      start: this.activeEvent.start ? this.activeEvent.start : new Date(),
      end: this.activeEvent.end ? this.activeEvent.end : null,
      draggable: this.activeEvent.draggable ? this.activeEvent.draggable : true,
      cssClass: this.activeEvent.cssClass ? this.activeEvent.cssClass : null,
      description: this.activeEvent.description ? this.activeEvent.description : null
    });
  }

  onColumnClicked(event: any) {
    console.log('clicked column:', event.isoDayNumber);
  }

  onDayClicked(event: any) {
    // console.log('clicked day:', event.day.date);
    this.createEvent(event.day.date);
  }

  onDayHeaderClicked(event: any) {
    // console.log('clicked day header:', event.day.date);
    this.createEvent(event.day.date);
  }

  onHourSegmentClicked(event: any) {
    // console.log('clicked hour segment:', event.date);
    this.createEvent(event.date);
  }

  createEvent(date: Date) {
    console.log('Create event', date);

    // prepare a new event object
    const newEvent: CustomCalendarEvent = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random id
      title: 'New Event',
      start: date
    };

    // load the new event as the active event
    this.activeEvent = newEvent;
    this.loadActiveEventFormData();

    // pop the edit event modal
    this.editEventModal.show();
  }

  eventClicked({event}: { event: CustomCalendarEvent }): void {
    console.log('Event clicked', event);
    this.activeEvent = event;
    this.eventDetailModal.show();
  }

  onEventDetailModalClose() {
    this.eventDetailModal.hide();
    this.activeEvent = null;
  }

  onEditEventModalClose() {
    this.editEventModal.hide();
    this.activeEvent = null;
  }

  onEditEvent() {
    this.eventDetailModal.hide();
    this.loadActiveEventFormData();
    this.editEventModal.show();
  }

  onDetailDeleteEvent() {
    this.eventDetailModal.hide();
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
    await this.dataService.deleteUserCalendarEvent(this.userId, this.activeEvent.id.toString());

    // dismiss the modal
    this.cancelEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  onUpdateEvent() {
    this.savingEvent = true;

    // if the event has no id, create one id now
    if (!this.activeEventF.id.value) {
      this.activeEventForm.patchValue({id: Math.random().toString(36).substr(2, 9)}); // generate semi-random id
    }

    const ev = this.activeEventForm.value;

    console.log(ev);

    // save the event
    if (!this.userId) {
      alert('No user ID');
      return;
    }
    this.dataService.saveUserCalendarEvent(this.userId, ev);

    // dismiss the modal
    this.editEventModal.hide();

    // reset the active event
    this.activeEvent = null;
    this.activeEventForm.reset();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
