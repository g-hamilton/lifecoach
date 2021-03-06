import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CoachProfile } from 'app/interfaces/coach.profile.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { CRMPersonHistoryEvent } from 'app/interfaces/crm.person.interface';

@Component({
  selector: 'app-coach-history-timeline',
  templateUrl: './coach-history-timeline.component.html',
  styleUrls: ['./coach-history-timeline.component.scss']
})
export class CoachHistoryTimelineComponent implements OnInit, OnChanges {

  @Input() public coachProfile: CoachProfile;
  @Input() public history: CRMPersonHistoryEvent[];
  @Input() public enrolledServices: CoachingService[];
  @Input() public enrolledPrograms: CoachingProgram[];
  @Input() public enrolledCourses: CoachingCourse[];

  public sortBy = 'newest' as 'newest';

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.history) {
      this.sortHistoryEvents(this.sortBy); // run a default sort to display newest items first
    }
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toLocaleDateString();
  }

  getDisplayTime(unix: number) {
    return new Date(unix * 1000).toLocaleTimeString();
  }

  getDate(milliseconds: number) {
    return new Date(milliseconds);
  }

  get dateNow() {
    return new Date();
  }

  onSortByHandler(ev: any) {
    console.log('sort by:', ev.target.value);
    this.sortBy = ev.target.value;
    this.sortHistoryEvents(this.sortBy); // sort timeline items
  }

  sortHistoryEvents(by: 'newest' | 'oldest') {
    if (by === 'newest') {
      this.history.sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
    } else {
      this.history.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
    }
  }

  getServiceTitle(id: string) {
    if (!this.enrolledServices) {
      return '';
    }
    const filtered = this.enrolledServices.filter(i => i.serviceId === id);
    if (filtered && filtered.length) {
      const title = `${filtered[0].type ? filtered[0].type === 'individual' ? 'Individual' : '' : 'Individual'} ${filtered[0].sessionDuration ? filtered[0].sessionDuration + 'min' : ''} Coaching Session`;
      return title;
    }
    return '';
  }

  getProgramTitle(id: string) {
    if (!this.enrolledPrograms) {
      return '';
    }
    const filtered = this.enrolledPrograms.filter(i => i.programId === id);
    if (filtered && filtered.length) {
      return filtered[0].title;
    }
    return '';
  }

  getCourseTitle(id: string) {
    if (!this.enrolledCourses) {
      return '';
    }
    const filtered = this.enrolledCourses.filter(i => i.courseId === id);
    if (filtered && filtered.length) {
      return filtered[0].title;
    }
    return '';
  }

}
