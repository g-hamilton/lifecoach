import { Component, OnInit, Input } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-resource-upload-task',
  templateUrl: './course-resource-upload-task.component.html',
  styleUrls: ['./course-resource-upload-task.component.scss']
})
export class CourseResourceUploadTaskComponent implements OnInit {

  @Input() uid: string;
  @Input() file: File;
  @Input() course: CoachingCourse;
  @Input() lectureId: string;

  task: AngularFireUploadTask;
  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: string;

  public inProgress: boolean;

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

    // We must have the course ID to associate video in storage
    if (!this.course.courseId) {
      this.alertService.alert('warning-message', 'Oops!',
      `Error: No course ID.`);
      return;
    }

    // We must have the lecture ID to associate video to lecture in the DB
    if (!this.lectureId) {
      this.alertService.alert('warning-message', 'Oops!',
      `Error: No lecture ID.`);
      return;
    }

    // File type must be ??
    // if (!this.file.type.includes('video')) {
    //   this.alertService.alert('warning-message', 'Oops!',
    //   `It looks like you've added an unsupported file type. Your file must be a video.`);
    //   return;
    // }

    // File size must be below 1.0GB
    if (this.file.size > 1073741824) {
      this.alertService.alert('warning-message', 'Oops!',
      `It looks like your file is over 1.0GB.`);
      return;
    }

    this.inProgress = true;

    // Ensure the filename is unique, otherwise any upload with the same file name
    // will override the previous file with a new token, making the previous token obsolete
    const timestamp = Math.round(new Date().getTime() / 1000); // unix timestamp
    const uniqueFileName = this.file.name + '_' + timestamp;

    // The storage path
    const path = `users/${this.uid}/courseResources/${uniqueFileName}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    this.analyticsService.startCourseResourceUpload();

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

          const courseCopy = JSON.parse(JSON.stringify(this.course)) as CoachingCourse; // clone the course to avoid reference errors

          // Find the index of the associated lecture in the course lectures array
          // Needed as we can't directly write to an array's index position in Firestore
          const index = courseCopy.lectures.findIndex(item => item.id === this.lectureId);
          if (index === -1) {
            console.log('Cannot find index of lecture within course lectures array!');
            return;
          }

          // Update the lecture object in the lectures array to associate this resource data to the lecture
          const resource = {
            downloadURL: this.downloadURL, // url (with token) to download the file from storage
            path, // path to the file in storage
            fileName: uniqueFileName,
            lastModified: this.file.lastModified, // date file was last modified (from user file system)
            lastUploaded: Math.round(new Date().getTime() / 1000) // user local timestamp in unix
          };
          // init resources array if no resources saved yet
          if (!courseCopy.lectures[index].resources) {
            courseCopy.lectures[index].resources = [];
          }
          // is resource already added to this lecture?
          const resIndex = courseCopy.lectures[index].resources.findIndex(i => i.fileName === resource.fileName);
          if (resIndex === -1) { // no
            courseCopy.lectures[index].resources.push(resource); // add it now
          } else { // yes
            courseCopy.lectures[index].resources[resIndex] = resource; // overwrite
          }

          // Update the course object now the lecture's resource array has been updated
          this.db.collection(`users/${this.uid}/courses`)
          .doc(this.course.courseId)
          .set(courseCopy, { merge: true });

          // Create/update the item as a user's library asset
          this.db.collection(`users/${this.uid}/courseLibrary`)
          .doc(resource.fileName)
          .set(resource, { merge: true });

          this.analyticsService.completeCourseResourceUpload();

          // this.alertService.alert('auto-close', 'Lecture Autosaved', 'Your lecture has been auto saved successfully!');

          this.inProgress = false; // dismiss the upload progress bar when complete

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
