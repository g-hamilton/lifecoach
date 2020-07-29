import { Component, OnInit, Input, ViewChild, OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { CoachingCourse, CoachingCourseLecture } from 'app/interfaces/course.interface';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CourseQuestion } from 'app/interfaces/q&a.interface';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { SearchService } from 'app/services/search.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-qa',
  templateUrl: './course-qa.component.html',
  styleUrls: ['./course-qa.component.scss']
})
export class CourseQaComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() course: CoachingCourse; // static course data
  @Input() userId: string;
  @Input() lecture: CoachingCourseLecture;

  @ViewChild('courseQuestionModal', {static: false}) public courseQuestionModal: ModalDirective;
  @ViewChild('platformQuestionModal', {static: false}) public platformQuestionModal: ModalDirective;

  public liveCourse: CoachingCourse;
  public userProfile: any;

  public totalHits = 0;
  public hitsPerPage = 10;
  public page = 1;
  public maxSize = 10;
  public questions: CourseQuestion[]; // TODO: or AlgoliaCourseQuestion[]

  public questionType: string;

  public courseQuestionForm: FormGroup;
  public platformQuestionForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public focus1: boolean;
  public focus1Touched: boolean;

  public titleMinLength = 6;
  public titleMaxLength = 255;
  public titleActualLength = 0;

  public errorMessages = {
    title: {
      minlength: `Lecture titles should be at least ${this.titleMinLength} characters.`,
      maxlength: `Lecture titles should be at less than ${this.titleMaxLength} characters.`
    }
  };

  public objKeys = Object.keys;

  public saving: boolean;

  public viewLoaded: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertService: AlertService,
    private searchService: SearchService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    this.buildCourseQuestionForm();
    this.buildPlatformQuestionForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  ngOnChanges() {
    if (this.userId && !this.userProfile) {
      // user could be coach or regular. try coach first...
      this.fetchCoachProfile();
    }
    if (this.course && !this.questions) {
      this.loadInitialQuestions(this.page);
    }
    if (this.course && !this.liveCourse) {
      // NB: as the parent component does not pass in an active course subscription (deliberately),
      // subscribe to the course and keep monitoring to update when question total changes in realtime.
      this.subscriptions.add(
        this.dataService.getUnlockedPublicCourse(this.course.courseId).subscribe(course => {
          if (course) {
            this.liveCourse = course;
            this.totalHits = course.questions;
          }
        })
      );
    }
  }

  buildCourseQuestionForm() {
    this.courseQuestionForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      detail: [null]
    });
  }

  buildPlatformQuestionForm() {
    this.platformQuestionForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      detail: [null]
    });
  }

  fetchCoachProfile() {
    const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
      if (coachProfile) {
        this.userProfile = coachProfile;
      } else { // user is not a coach, try regular...
        this.fetchRegularProfile();
      }
      tempSub.unsubscribe();
    });
    this.subscriptions.add(tempSub);
  }

  fetchRegularProfile() {
    const tempSub = this.dataService.getRegularProfile(this.userId).subscribe(regProfile => {
      if (regProfile) {
        this.userProfile = regProfile;
      }
      tempSub.unsubscribe();
    });
    this.subscriptions.add(tempSub);
  }

  async loadInitialQuestions(page: number) {
    this.subscriptions.add(
      this.dataService.getInitialCourseQuestions(this.course.courseId, this.hitsPerPage).subscribe(items => {
        // console.log(items);
        if (items.length) {
          this.questions = items;
        }
      })
    );
  }

  loadNextQuestions() {
    const lastDoc = this.questions[this.questions.length - 1];
    this.subscriptions.add(
      this.dataService.getNextCourseQuestions(this.course.courseId, this.hitsPerPage, lastDoc).subscribe(items => {
        console.log(items);
        if (items.length) {
          this.questions = items;
        }
      })
    );
  }

  loadPreviousQuestions() {
    const firstDoc = this.questions[0];
    this.subscriptions.add(
      this.dataService.getPreviousCourseQuestions(this.course.courseId, this.hitsPerPage, firstDoc).subscribe(items => {
        console.log(items);
        if (items.length) {
          this.questions = items;
        }
      })
    );
  }

  get cQF(): any {
    return this.courseQuestionForm.controls;
  }

  get pQF(): any {
    return this.platformQuestionForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onTitleInput(ev: any) {
    this.titleActualLength = (ev.target.value as string).length;
  }

  receivePageUpdate(event: number) {
    console.log(event);
    const requestedPage = event;
    if (requestedPage > this.page) { // we're going forwards
      this.loadNextQuestions();
      this.page = requestedPage;
    } else if (requestedPage < this.page) { // we're going backwards
      this.loadPreviousQuestions();
      this.page = requestedPage;
    }
  }

  async onSearchEvent(event: string) {
    console.log('Search event:', event);
    const filters = {
      query: event,
      facets: {
        courseId: this.course.courseId,
        type: 'course'
      }
    };
    const res = await this.searchService.searchCourseQuestions(this.hitsPerPage, this.page, filters);
    console.log(res);
    if (res && res.nbHits) {
      this.questions = res.hits;
      this.totalHits = res.nbHits;
    }
  }

  popQuestionModal() {
    if (this.questionType === 'course') {
      this.courseQuestionModal.show();
    }
    if (this.questionType === 'platform') {
      // this.platformQuestionModal.show();
      // NOT currently used. Redirecting all tech questions via freshdesk
    }
  }

  async askCourseQuestion() {
    // safety checks
    if (this.courseQuestionForm.invalid) {
      console.log('Invalid course question form!');
      return;
    }
    if (!this.userId) {
      console.log('Missing user ID!');
      return;
    }

    const qf = this.courseQuestionForm.value as any;
    // console.log(qf);

    const question: CourseQuestion = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random uid
      type: 'course',
      title: qf.title,
      askerUid: this.userId,
      askerFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
      askerLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
      courseId: this.course.courseId,
      courseSellerId: this.course.sellerUid,
      lectureId: this.lecture.id,
      created: Math.round(new Date().getTime() / 1000), // unix timestamp
      askerPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
      detail: qf.detail
    };
    // console.log(question);

    this.analyticsService.askCourseQuestion(question);

    await this.dataService.saveCourseQuestion(question);

    this.alertService.alert('success-message', 'Success!', 'Your question has been posted.');
  }

  async askPlatformQuestion() {
    // safety checks
    if (this.platformQuestionForm.invalid) {
      console.log('Invalid platform question form!');
      return;
    }
    if (!this.userId) {
      console.log('Missing user ID!');
      return;
    }

    const qf = this.platformQuestionForm.value as any;
    console.log(qf);

    const question: CourseQuestion = {
      id: Math.random().toString(36).substr(2, 9), // generate semi-random uid
      type: 'platform',
      title: qf.title,
      askerUid: this.userId,
      askerFirstName: this.userProfile && this.userProfile.firstName ? this.userProfile.firstName : 'Anonymous',
      askerLastName: this.userProfile && this.userProfile.lastName ? this.userProfile.lastName : 'Student',
      courseId: this.course.courseId,
      courseSellerId: this.course.sellerUid,
      lectureId: this.lecture.id,
      created: Math.round(new Date().getTime() / 1000), // unix timestamp
      askerPhoto: this.userProfile && this.userProfile.photo ? this.userProfile.photo : null,
      detail: qf.detail
    };
    // console.log(question);

    this.analyticsService.askCourseQuestion(question);

    await this.dataService.saveCourseQuestion(question);

    this.alertService.alert('success-message', 'Success!', 'Your question has been posted.');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
