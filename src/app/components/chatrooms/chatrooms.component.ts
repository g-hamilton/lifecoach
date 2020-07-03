import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chatrooms',
  templateUrl: './chatrooms.component.html',
  styleUrls: ['./chatrooms.component.scss']
})
export class ChatroomsComponent implements OnInit {

  @Input() userId: string;
  @Input() userRooms: any;

  constructor() { }

  ngOnInit() {
  }

}
