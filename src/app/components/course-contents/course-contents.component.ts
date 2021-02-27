import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-contents',
  templateUrl: './course-contents.component.html',
  styleUrls: ['./course-contents.component.scss']
})
export class CourseContentsComponent implements OnInit {

  @Input() course: CoachingCourse;

  public browser: boolean;
  public previewVideoDownloadUrl: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
    }
  }

  expandAllSections() {
    this.course.sections.forEach(s => {
      return s.expanded = true;
    });
  }

  fancyTimeFormat(time: number) {
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

  get totalLecturesRuntime() {
    let totalSeconds = 0;

    this.course.lectures.forEach(lecture => {
      if (lecture.type === 'Video' && lecture.video && lecture.video.duration) {
        totalSeconds += lecture.video.duration;
      }
    });

    return this.fancyTimeFormat(totalSeconds);
  }

  onPreviewModalHide(event: any) {
    // console.log(event);
    this.previewVideoDownloadUrl = null;
  }

}
