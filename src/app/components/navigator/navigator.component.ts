import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/*
  Note: Using the NGB-Bootstrap Pagination component in the UI to handle pagination.
  https://valor-software.com/ngx-bootstrap/#/pagination
  This component takes inputs to model the UI on.
  When the user updates the UI the component emits the new page value.
*/

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {

  @Input() page: number;
  @Input() totalItems: number;
  @Input() itemsPerPage: number;
  @Input() maxSize: number;
  @Output() messageEvent = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {}

  pageChanged(event: any) {
    this.messageEvent.emit(event.page);
  }

}
