import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-learn-lectures-navigator',
  templateUrl: './learn-lectures-navigator.component.html',
  styleUrls: ['./learn-lectures-navigator.component.scss']
})
export class LearnLecturesNavigatorComponent implements OnInit {

  @Input() course: CoachingCourse;
  @Input() lecturesComplete: string[];
  @Input() adminMode: boolean; // Admin reviewers share this component with course creators and students. True for admin reviewers.
  @Input() previewAsStudent: boolean; // True if course creator is previewing course as student

  @Output() lectureCompleteEvent = new EventEmitter<any>();

  public baseUrl = '/course'; // default base url for navigation

  constructor() { }

  ngOnInit() {
    if (this.adminMode) {
      this.baseUrl = '/admin-course-review-player'; // if in admin review mode update the base Url
    }
  }

  fancyTimeFormat(time: number) {

    // Catch no time
    if (!time) {
      return '0:00';
    }

    // Hours, minutes and seconds
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = '';

    if (hrs > 0) {
        ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;

    return ret;
  }

  getLecturesTotalDuration(sectionIndex: number) {
    let seconds = 0;
    if (this.course.sections[sectionIndex].lectures) {
      this.course.sections[sectionIndex].lectures.forEach(lecture => {
        const lectureIndex = this.course.lectures.findIndex(i => i.id === lecture);
        if (lectureIndex !== -1) {
          if (this.course.lectures[lectureIndex].type === 'Video') {
            if (this.course.lectures[lectureIndex].video && this.course.lectures[lectureIndex].video.duration) {
              seconds += this.course.lectures[lectureIndex].video.duration;
            }
          }
        }
      });
    }
    return this.fancyTimeFormat(seconds);
  }

  onLectureCompleteChange(lectureId: string, event: any) {
    const complete = event.target.checked;
    const ev = {
      lectureId,
      complete
    };
    this.lectureCompleteEvent.emit(JSON.stringify(ev));
  }

  getSectionCompletedNumLectures(sectionIndex: number) {
    const completedLecturesInSection = [];
    if (this.course.sections[sectionIndex].lectures) {
      this.course.sections[sectionIndex].lectures.forEach(l => {
        if (this.lecturesComplete.includes(l)) {
          completedLecturesInSection.push(l);
        }
      });
    }
    return completedLecturesInSection.length;
  }

}
