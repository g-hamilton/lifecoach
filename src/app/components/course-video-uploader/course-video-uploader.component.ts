import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-video-uploader',
  templateUrl: './course-video-uploader.component.html',
  styleUrls: ['./course-video-uploader.component.scss']
})
export class CourseVideoUploaderComponent implements OnInit {

  @Input() uid: string;
  @Input() course: CoachingCourse;
  @Input() lectureId: string;

  public isHovering: boolean;
  private video: File;
  public videoUrl: SafeUrl;
  public videos = [];

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
    // console.log(event);
  }

  getDuration(event: any) {
    const duration = event.target.duration;
    console.log('Duration', duration);
    // add this file (will trigger upload via upload-task component init)
    const data = {
      file: this.video,
      duration
    };
    this.videos.push(data);
  }

  onDrop(event: any) {
    console.log(event);

    let files: FileList;

    if (event.target) { // selected
      files = event.target.files;
    } else { // dropped
      files = event;
    }

    console.log(files);

    for (let i = 0; i < files.length; i++) {
      // create an invisible player to get video duration before upload (triggers hidden video element load in template)
      this.video = files.item(i);
      this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.video));
    }
    const target = event.target || event.srcElement;
    target.value = ''; // reset input so we can pick the same file again
  }

}
