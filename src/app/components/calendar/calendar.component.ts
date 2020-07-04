import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @ViewChild('eventDetailModal', { static: false }) public eventDetailModal: ModalDirective;
  @ViewChild('editEventModal', { static: false }) public editEventModal: ModalDirective;

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes
  public activeEvent: CalendarEvent;

  public events: CalendarEvent[] = [
    {
      title: 'Click me',
      start: new Date(),
      cssClass: 'custom-event-class'
    },
    {
      title: 'Or click me',
      start: new Date(),
      cssClass: 'custom-event-class'
    },
  ];

  constructor() { }

  ngOnInit() {
    this.doStuff();
  }

  doStuff() {
    setTimeout(() => {
      this.events.push({
        title: 'Wow',
        start: new Date(),
        cssClass: 'custom-event-class'
      });
      this.refresh.next();
    }, 5000);
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
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
    this.editEventModal.show();
  }

  onDeleteEvent() {
    //
  }

  onSaveEvent() {
    //
  }

}
