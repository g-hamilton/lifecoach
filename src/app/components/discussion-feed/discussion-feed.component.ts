import { Component, OnInit, Input } from '@angular/core';
import { CourseQuestion, CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-discussion-feed',
  templateUrl: './discussion-feed.component.html',
  styleUrls: ['./discussion-feed.component.scss']
})
export class DiscussionFeedComponent implements OnInit {

  @Input() userId: string;
  @Input() feed: CourseQuestionReply[];
  @Input() loading: boolean;
  @Input() done: boolean;

  public selectedQuestionId: string;
  public selectedQuestion: CourseQuestion;
  public lectureTitle: string;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.roomId) {
        this.selectedQuestionId = params.roomId;
        this.getSelectedQuestionDetail();
      }
    });
  }

  getSelectedQuestionDetail() {
    const qSub = this.dataService.getCourseQuestionById(this.selectedQuestionId).subscribe(question => {
      if (question) {
        this.selectedQuestion = question;
        this.getLectureTitle();
      }
      qSub.unsubscribe();
    });
  }

  getLectureTitle() {
    if (this.selectedQuestion) {
      const courseSub = this.dataService.getPublicCourse(this.selectedQuestion.courseId).subscribe(course => {
        if (course) {
          const index = course.lectures.findIndex(i => i.id === this.selectedQuestion.lectureId);
          if (index !== -1) {
            this.lectureTitle = course.lectures[index].title;
          }
        }
        courseSub.unsubscribe();
      });
    }
  }

  displayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toDateString();
  }

}
