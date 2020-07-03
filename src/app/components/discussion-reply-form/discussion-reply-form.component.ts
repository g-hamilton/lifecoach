import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { ActivatedRoute } from '@angular/router';
import { CourseQuestionReply } from 'app/interfaces/q&a.interface';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-discussion-reply-form',
  templateUrl: './discussion-reply-form.component.html',
  styleUrls: ['./discussion-reply-form.component.scss']
})
export class DiscussionReplyFormComponent implements OnInit {

  @Input() userId: string;
  @Input() roomId: string;
  @Input() userProfile: any;

  private questionId: string;

  public replyForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public sendingMessage: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.buildReplyForm();
    this.checkRouteForQuestionId();
  }

  buildReplyForm() {
    this.replyForm = this.formBuilder.group(
      {
        message: ['', [Validators.required]]
      }
    );
  }

  checkRouteForQuestionId() {
    this.route.params.subscribe(params => {
      if (params && params.roomId) {
        this.questionId = params.roomId;
      }
    });
  }

  get replyF(): any {
    return this.replyForm.controls;
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
    if (!this.questionId) {
      console.log('Missing selected question Id!');
      return;
    }

    this.analyticsService.sendCourseDiscussionReply();

    const rf = this.replyForm.value as any;
    console.log(rf);

    const reply: CourseQuestionReply = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random uid
      questionId: this.questionId,
      replierUid: this.userId,
      replierFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
      replierLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
      created: Math.round(new Date().getTime() / 1000), // unix timestamp
      replierPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
      detail: rf.message
    };

    console.log(reply);

    await this.dataService.saveCourseReply(reply);

    this.replyForm.patchValue({ detail: null }); // reset form detail field

    this.alertService.alert('success-message', 'Success!', 'Your reply has been posted.');

  }

}
