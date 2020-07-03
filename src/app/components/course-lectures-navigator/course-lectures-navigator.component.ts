import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CoachingCourse, CoachingCourseSection, CoachingCourseLecture } from 'app/interfaces/course.interface';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-course-lectures-navigator',
  templateUrl: './course-lectures-navigator.component.html',
  styleUrls: ['./course-lectures-navigator.component.scss']
})
export class CourseLecturesNavigatorComponent implements OnInit {

  @Input() course: CoachingCourse;
  @Output() courseUpdateEvent = new EventEmitter<CoachingCourse>();

  public targetUserUid: string;

  constructor(
    private dataService: DataService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(qP => {
      if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
          this.targetUserUid = qP.targetUser;
      }
    });
  }

  get allLectureLists() {
    const arr = [];
    if (this.course) {
      this.course.sections.forEach((s, i) => {
        arr.push('lectureList' + i);
      });
    }
    return arr;
  }

  async onSectionDrop(ev: CdkDragDrop<any>) { // fires when a section item is dragged and dropped
    console.log(ev);
    // re-order dropped element
    const removedElement = this.course.sections.splice(ev.previousIndex, 1) [0];
    this.course.sections.splice(ev.currentIndex, 0, removedElement);
    this.autoSaveCourse();
  }

  async onLectureDrop(ev: CdkDragDrop<any>) { // fires when a lecture item is dragged and dropped
    console.log(ev);
    // re-order dropped element
    const removedElement = this.course.sections[ev.previousContainer.id.slice(11)].lectures.splice(ev.previousIndex, 1) [0];
    this.course.sections[ev.container.id.slice(11)].lectures.splice(ev.currentIndex, 0, removedElement);
    this.autoSaveCourse();
  }

  onAddNewLecture() {
    this.analyticsService.clickCreateCourseLecture();
  }

  onAddNewSection() {
    this.analyticsService.clickCreateCourseSection();
  }

  async autoSaveCourse() {
    // Autosave the course object
    const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
    await this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);
  }

  async confirmDeleteSection(section: CoachingCourseSection, index: number) {
    // Sections must be empty before delete
    if (section.lectures && section.lectures.length > 0) { // not empty!
      this.alertService.alert('warning-message', 'Just a second!',
      'This section still has lectures in it. Please move or delete all lectures to proceed.');
    } else { // safe to delete
      // confirm with user
      const res = await this.alertService.alert('warning-message-and-confirmation',
      'Delete section?', 'Are you sure you want to delete this section?') as any;
      if (res && res.action) { // user confirmed, proceed with delete section
        this.course.sections.splice(index, 1);
        this.autoSaveCourse();
        this.analyticsService.deleteCourseSection();
      }
    }
  }

  async confirmDeleteLecture(sectionIndex: number, lecturesIndex: number, lecture: CoachingCourseLecture) {
    // confirm with user
    const res = await this.alertService.alert('warning-message-and-confirmation',
    'Delete lecture?', 'Are you sure you want to delete this lecture?') as any;
    if (res && res.action) { // user confirmed, proceed with delete lecture
      this.course.sections[sectionIndex].lectures.splice(lecturesIndex, 1); // remove associated lecture id from section
      const i = this.course.lectures.findIndex(item => item.id === lecture.id);
      if (i !== -1) {
        this.course.lectures.splice(i, 1);
      }
      this.autoSaveCourse();
      this.analyticsService.deleteCourseLecture();
      // navigate away from 'old' activated lecture id
      this.router.navigate(['/my-courses', this.course.courseId, 'content', 'section', this.course.sections[sectionIndex].id], { queryParams: { targetUser: this.targetUserUid }});
    }
  }

  truncate = (input: string, max: number) => input.length > max ? `${input.substring(0, max)}...` : input;

}
