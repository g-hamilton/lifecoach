import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile-video-uploader',
  templateUrl: './profile-video-uploader.component.html',
  styleUrls: ['./profile-video-uploader.component.scss']
})
export class ProfileVideoUploaderComponent implements OnInit {

  @Input() uid: string;

  isHovering: boolean;
  files: File[] = [];

  constructor() { }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
    console.log(event);
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
