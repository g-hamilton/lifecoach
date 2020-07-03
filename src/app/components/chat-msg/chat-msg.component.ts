import { Component, OnInit, Input } from '@angular/core';

import { ChatMessage } from 'app/interfaces/chat.message';

@Component({
  selector: 'app-chat-msg',
  templateUrl: './chat-msg.component.html',
  styleUrls: ['./chat-msg.component.scss']
})
export class ChatMsgComponent implements OnInit {

  @Input() userId: string;
  @Input() message: ChatMessage;

  constructor() { }

  ngOnInit() {
  }

  convertTimestamp(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const timeString = date.toLocaleTimeString();
    return `${day} ${date.toLocaleDateString()} ${timeString}`;
   }

}
