import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-person-history-timeline',
  templateUrl: './person-history-timeline.component.html',
  styleUrls: ['./person-history-timeline.component.scss']
})
export class PersonHistoryTimelineComponent implements OnInit, OnChanges {

  @Input() public person: CRMPerson;
  @Input() public enrolledServices: CoachingService[];
  @Input() public enrolledPrograms: CoachingProgram[];
  @Input() public enrolledCourses: CoachingCourse[];

  public bsModalRef: BsModalRef;

  public sortBy = 'newest' as 'newest';

  constructor(
    private modalService: BsModalService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.person && this.person.history) {
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
      this.person.history.sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
    } else {
      this.person.history.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
    }
  }

  openInviteModal(type: 'ecourse' | 'program') {
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        type,
        invitee: this.person
      }
    };
    this.bsModalRef = this.modalService.show(CoachInviteComponent, config);
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
