import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-admin-video-upload-task',
  templateUrl: './admin-video-upload-task.component.html',
  styleUrls: ['./admin-video-upload-task.component.scss']
})
export class AdminVideoUploadTaskComponent implements OnInit {

  @Input() uid: string;
  @Input() file: File;

  @Output() vidUploadedEvent = new EventEmitter<any>(); // <-- So we can emit the chosen data to a parent component

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: string;

  public inProgress: boolean;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.startUpload();
  }

  startUpload() {

    // File type must be video
    if (!this.file.type.includes('video')) {
      this.alertService.alert('warning-message', 'Oops!',
      `It looks like you've added an unsupported file type. Your file must be a video.`);
      return;
    }

    // File type must be .mp4
    if (!this.file.type.includes('mp4')) {
      this.alertService.alert('warning-message', 'Oops!',
      `Videos must be .mp4 file format to ensure correct playback on all devices.`);
      return;
    }

    // File size must be below 4.0GB
    if (this.file.size > 4294967296) {
      this.alertService.alert('warning-message', 'Oops!',
      `It looks like your video file is over 4.0GB. Try a shorter video or reducing the quality a little to create a smaller file.`);
      return;
    }

    this.inProgress = true;

    // Ensure the filename is unique, otherwise any upload with the same file name
    // will override the previous file with a new token, making the previous token obsolete
    const timestamp = Math.round(new Date().getTime() / 1000); // unix timestamp
    const uniqueFileName = this.file.name + '_' + timestamp;

    // The storage path
    const path = `platform/${uniqueFileName}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    try {
    // The main task
    this.task = this.storage.upload(path, this.file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize( async () =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        // Associate this video data to the user
        const video = {
          downloadURL: this.downloadURL, // url (with token) to download the file from storage
          path, // path to the file in storage
          fileName: uniqueFileName,
          lastModified: this.file.lastModified, // date file was last modified (from user file system)
          lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
        };

        this.db.collection(`platform/content/videos`)
        .doc(video.fileName)
        .set(video, { merge: true });

        this.inProgress = false; // dismiss the upload progress bar when complete

        // Emit the promo video object to be saved into the course
        this.vidUploadedEvent.emit(video);

      }),
    );
    } catch (err) {
      console.error(err);
    }

  }

  isActive(snapshot: any) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
