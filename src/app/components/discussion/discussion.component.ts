import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CourseQuestion } from 'app/interfaces/q&a.interface';
import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.scss']
})
export class DiscussionComponent implements OnInit, OnDestroy {

  @Input() userId: string;
  @Input() question: CourseQuestion;

  public lectureTitle = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService
    ) { }

  ngOnInit() {
    this.getLectureTitle();
  }

  getLectureTitle() {
    if (this.question) {
      const courseSub = this.dataService.getPublicCourse(this.question.courseId).subscribe(course => {
        if (course) {
          const index = course.lectures.findIndex(i => i.id === this.question.lectureId);
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
