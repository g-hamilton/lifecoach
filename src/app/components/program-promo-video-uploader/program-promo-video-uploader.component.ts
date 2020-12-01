import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-promo-video-uploader',
  templateUrl: './program-promo-video-uploader.component.html',
  styleUrls: ['./program-promo-video-uploader.component.scss']
})
export class ProgramPromoVideoUploaderComponent implements OnInit {

  @Input() uid: string;
  @Input() program: CoachingProgram;

  @Output() promoVidUploadedEvent = new EventEmitter<any>(); // <-- So we can emit the chosen data to a parent component

  isHovering: boolean;
  files: File[] = [];

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

  onPromoVideoUploadEvent(ev: any) {
    // Emit the promo video object to be saved into the course
    this.promoVidUploadedEvent.emit(ev);
  }

}
