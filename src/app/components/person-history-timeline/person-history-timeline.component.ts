import { Component, OnInit, Input } from '@angular/core';
import { CRMPerson } from 'app/interfaces/crm.person.interface';

@Component({
  selector: 'app-person-history-timeline',
  templateUrl: './person-history-timeline.component.html',
  styleUrls: ['./person-history-timeline.component.scss']
})
export class PersonHistoryTimelineComponent implements OnInit {

  @Input() public person: CRMPerson;

  constructor() { }

  ngOnInit() {
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toLocaleDateString();
  }

  getDisplayTime(unix: number) {
    return new Date(unix * 1000).toLocaleTimeString();
  }

}
