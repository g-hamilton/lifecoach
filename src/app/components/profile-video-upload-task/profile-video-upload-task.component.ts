import { Component, OnInit, Input } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-profile-video-upload-task',
  templateUrl: './profile-video-upload-task.component.html',
  styleUrls: ['./profile-video-upload-task.component.scss']
})
export class ProfileVideoUploadTaskComponent implements OnInit {

  @Input() uid: string;
  @Input() file: File;

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: string;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
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

    // File size must be below 350mb
    if (this.file.size > 367001600) {
      this.alertService.alert('warning-message', 'Oops!',
      `It looks like your video file is over 350mb. Try a shorter video or reducing the quality a little to create a smaller file.`);
      return;
    }

    // Ensure the filename is unique, otherwise any upload with the same file name
    // will override the previous file with a new token, making the previous token obsolete
    const timestamp = Math.round(new Date().getTime() / 1000); // unix timestamp
    const uniqueFileName = this.file.name + '_' + timestamp;

    // The storage path
    const path = `users/${this.uid}/profileVideos/${uniqueFileName}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    this.analyticsService.startProfileVideoUpload();

    // The main task
    this.task = this.storage.upload(path, this.file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize( async () =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        this.db.collection(`users/${this.uid}/profileVideos`)
        .add({
          downloadURL: this.downloadURL, // url (with token) to download the file from storage
          path, // path to the file in storage
          fileName: uniqueFileName,
          lastModified: this.file.lastModified, // date file was last modified (from user file system)
          lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
        });

        this.analyticsService.completeProfileVideoUpload();
      }),
    );
  }

  isActive(snapshot: any) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
