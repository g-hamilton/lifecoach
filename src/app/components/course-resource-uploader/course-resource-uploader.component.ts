import { Component, OnInit, Input } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-resource-uploader',
  templateUrl: './course-resource-uploader.component.html',
  styleUrls: ['./course-resource-uploader.component.scss']
})
export class CourseResourceUploaderComponent implements OnInit {

  @Input() uid: string;
  @Input() course: CoachingCourse;
  @Input() lectureId: string;

  public isHovering: boolean;
  public files: File[] = [];

  constructor() { }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
    // console.log(event);
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
      this.files.push(files.item(i));
    }
    const target = event.target || event.srcElement;
    target.value = ''; // reset input so we can pick the same file again
  }

}
