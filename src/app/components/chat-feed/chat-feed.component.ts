import { Component, OnInit, Input } from '@angular/core';
import { ChatMessage } from 'app/interfaces/chat.message';

@Component({
  selector: 'app-chat-feed',
  templateUrl: './chat-feed.component.html',
  styleUrls: ['./chat-feed.component.scss']
})
export class ChatFeedComponent implements OnInit {

  @Input() userId: string;
  @Input() feed: ChatMessage[];

  constructor() { }

  ngOnInit() {
  }

}
