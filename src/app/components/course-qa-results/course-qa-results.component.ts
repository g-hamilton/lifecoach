import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { CourseQuestion, CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { SearchService } from 'app/services/search.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-course-qa-results',
  templateUrl: './course-qa-results.component.html',
  styleUrls: ['./course-qa-results.component.scss']
})
export class CourseQaResultsComponent implements OnInit, AfterViewInit {

  @Input() userId: string;
  @Input() userProfile: any;
  @Input() course: CoachingCourse;
  @Input() results: CourseQuestion[];

  public selectedQuestion: CourseQuestion;
  public replyForm: FormGroup;
  public replies: CourseQuestionReply[];

  public hitsPerPage = 6;
  public page = 1;
  public maxSize = 10;

  public viewLoaded: boolean;

  constructor(
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private searchService: SearchService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.buildReplyForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  buildReplyForm() {
    this.replyForm = this.formBuilder.group({
      detail: [null]
    });
  }

  getLectureTitle(lectureId: string) {
    if (this.course) {
      const index = this.course.lectures.findIndex(i => i.id === lectureId);
      if (index !== -1) {
        return this.course.lectures[index].title;
      }
      return '';
    }
    return '';
  }

  displayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toDateString();
  }

  async upVote(question: CourseQuestion) {
    console.log('upvote', question);
    this.alertService.alert('auto-close', 'Success', 'Thanks for upvoting this question!');
    await this.dataService.upVoteCourseQuestion(question, this.userId);
  }

  async upVoteReply(reply: CourseQuestionReply) {
    console.log('upvote', reply);
    this.alertService.alert('auto-close', 'Success', 'Thanks for upvoting this reply!');
    await this.dataService.upVoteCourseQuestionReply(reply, this.userId);
  }

  loadSelectedQuestionReplies() {
    this.dataService.getInitialQuestionReplies(this.selectedQuestion.id, this.hitsPerPage).subscribe(items => {
      console.log(items);
      if (items.length) {
        this.replies = items;
      }
    });
  }

  loadNextQuestionReplies() {
    const lastDoc = this.replies[this.replies.length - 1];
    this.dataService.getNextQuestionReplies(this.selectedQuestion.id, this.hitsPerPage, lastDoc).subscribe(items => {
      console.log(items);
      if (items.length) {
        this.replies = items;
      }
    });
  }

  loadPreviousQuestionReplies() {
    const firstDoc = this.replies[0];
    this.dataService.getPreviousQuestionReplies(this.selectedQuestion.id, this.hitsPerPage, firstDoc).subscribe(items => {
      console.log(items);
      if (items.length) {
        this.replies = items;
      }
    });
  }

  receivePageUpdate(event: number) {
    console.log(event);
    const requestedPage = event;
    if (requestedPage > this.page) { // we're going forwards
      this.loadNextQuestionReplies();
      this.page = requestedPage;
    } else if (requestedPage < this.page) { // we're going backwards
      this.loadPreviousQuestionReplies();
      this.page = requestedPage;
    }
  }

  async addReply() {

    // safety checks
    if (this.replyForm.invalid) {
      console.log('Invalid reply form!');
      return;
    }
    if (!this.userId) {
      console.log('Missing user ID!');
      return;
    }
    if (!this.selectedQuestion || !this.selectedQuestion.id) {
      console.log('Missing selected question!');
      return;
    }

    const rf = this.replyForm.value as any;
    console.log(rf);

    const reply: CourseQuestionReply = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random uid
      questionId: this.selectedQuestion.id,
      replierUid: this.userId,
      replierFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
      replierLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
      created: Math.round(new Date().getTime() / 1000), // unix timestamp
      replierPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
      detail: rf.detail
    };

    console.log(reply);

    this.analyticsService.sendCourseDiscussionReply();

    await this.dataService.saveCourseReply(reply);

    this.replyForm.patchValue({ detail: null }); // reset form detail field

    this.alertService.alert('success-message', 'Success!', 'Your reply has been posted.');

  }

}
