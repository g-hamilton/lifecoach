import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})
export class DiscussionsComponent implements OnInit {

  @Input() userId: string;
  @Input() userRooms: any;

  constructor() { }

  ngOnInit() {
  }

}
