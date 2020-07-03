import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public daysInWeek = 7;
  public refresh: Subject<any> = new Subject(); // allows us to refresh the view when data changes

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

}
