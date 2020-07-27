import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CourseQuestion, CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discussion-feed',
  templateUrl: './discussion-feed.component.html',
  styleUrls: ['./discussion-feed.component.scss']
})
export class DiscussionFeedComponent implements OnInit, OnDestroy {

  @Input() userId: string;
  @Input() feed: CourseQuestionReply[];
  @Input() loading: boolean;
  @Input() done: boolean;

  public selectedQuestionId: string;
  public selectedQuestion: CourseQuestion;
  public lectureTitle: string;

  private subscriptions: Subscription = new Subscription();

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
    this.subscriptions.add(qSub);
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
      this.subscriptions.add(courseSub);
    }
  }

  displayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toDateString();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
