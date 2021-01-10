import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CRMPerson } from 'app/interfaces/crm.person.interface';

@Component({
  selector: 'app-person-history-timeline',
  templateUrl: './person-history-timeline.component.html',
  styleUrls: ['./person-history-timeline.component.scss']
})
export class PersonHistoryTimelineComponent implements OnInit, OnChanges {

  @Input() public person: CRMPerson;

  public sortBy = 'newest' as 'newest';

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.person && this.person.history) {
      this.sortHistoryEvents(this.sortBy); // run a default sort to display newest items first
    }
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toLocaleDateString();
  }

  getDisplayTime(unix: number) {
    return new Date(unix * 1000).toLocaleTimeString();
  }

  onSortByHandler(ev: any) {
    console.log('sort by:', ev.target.value);
    this.sortBy = ev.target.value;
    this.sortHistoryEvents(this.sortBy); // sort timeline items
  }

  sortHistoryEvents(by: 'newest' | 'oldest') {
    if (by === 'newest') {
      this.person.history.sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
    } else {
      this.person.history.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
    }
  }

}
