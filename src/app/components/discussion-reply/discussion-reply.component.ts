import { Component, OnInit, Input } from '@angular/core';
import { CourseQuestionReply } from 'app/interfaces/q&a.interface';

@Component({
  selector: 'app-discussion-reply',
  templateUrl: './discussion-reply.component.html',
  styleUrls: ['./discussion-reply.component.scss']
})
export class DiscussionReplyComponent implements OnInit {

  @Input() userId: string;
  @Input() reply: CourseQuestionReply;

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
