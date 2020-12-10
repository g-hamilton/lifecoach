import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges, AfterViewInit, ViewChild} from '@angular/core';
import { CoachingCourse, CoachingCourseLecture, CoachingCourseVideo, CoachingCourseResource } from 'app/interfaces/course.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-course-lecture',
  templateUrl: './course-lecture.component.html',
  styleUrls: ['./course-lecture.component.scss']
})
export class CourseLectureComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() userId: string;
  @Input() isNewLecture: boolean;
  @Input() activatedSectionId: string;
  @Input() activatedLectureId: string;
  @Input() course: CoachingCourse;

  @ViewChild('lectureTypeTabs', { static: false }) lectureTypeTabs: TabsetComponent;

  public browser: boolean;

  public lectureForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public titleMinLength = 4;
  public titleMaxLength = 100;
  public titleActualLength = 0;

  public errorMessages = {
    title: {
      minlength: `Lecture titles should be at least ${this.titleMinLength} characters.`,
      maxlength: `Lecture titles should be at less than ${this.titleMaxLength} characters.`
    }
  };

  public saving: boolean;
  public saveAttempt: boolean;

  public objKeys = Object.keys;

  public videoSources = [] as any;

  public viewLoaded: boolean;

  public tinymceInit: any;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private storageService: StorageService
  ) {
    this.tinymceInit = {
      height: 300,
      menubar: false,
      plugins: 'link lists paste image',
      toolbar: 'undo redo | formatselect | paste | bold italic backcolor link image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',

      /* we override default upload handler to simulate successful upload */
      images_upload_handler: (blobInfo, success, failure) => {
        this.handleTinyImageUpload(blobInfo.blob()).then((imageUrl) => {
          success(imageUrl);
        }).catch((error) => {
          failure(error);
        });
      }
    };
  }

  ngOnInit() {
    // console.log(this.userId);
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildLectureForm();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewLoaded = true;
    }, 100);
  }

  ngOnChanges() {
    if (this.course && this.activatedLectureId) {
      this.loadLecture();
    }
  }

  buildLectureForm() {
    this.lectureForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]],
      type: ['Video', [Validators.required]],
      video: [null],
      article: [null],
      preview: [false],
      includeResources: [false],
      resources: [null]
    });
  }

  async handleTinyImageUpload(blob: any) {
    // console.log('BLOB', blob);
    return await this.storageService.storeTinyMceImage(blob, this.userId);
  }

  get lectureF(): any {
    return this.lectureForm.controls;
  }

  loadLecture() {
    const matches = this.course.lectures.filter(item => item.id === this.activatedLectureId);
    const lecture = matches[0] as CoachingCourseLecture; // should only be 1 matching section id
    this.lectureForm.patchValue({
      id: lecture.id,
      title: lecture.title,
      type: lecture.type ? lecture.type : 'Video',
      video: lecture.video ? lecture.video : null,
      article: lecture.article ? lecture.article : null,
      preview: lecture.preview ? lecture.preview : false,
      includeResources: lecture.includeResources ? lecture.includeResources : false,
      resources: lecture.resources ? lecture.resources : null
    });
    if (lecture.video) {
      this.videoSources = []; // reset
      this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
        src: this.lectureF.video.value.downloadURL
      });
    }
    // manually open the correct lecture type tab for the user
    if (lecture.type === 'Video') {
      setTimeout(() => { // avoid change after checked error
        this.lectureTypeTabs.tabs[0].active = true; // manually open the video tab
      }, 100);
    } else if (lecture.type === 'Article') {
      setTimeout(() => { // avoid change after checked error
        this.lectureTypeTabs.tabs[1].active = true; // manually open the article tab
      }, 100);
    }
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onTitleInput(ev: any) {
    this.titleActualLength = (ev.target.value as string).length;
  }

  onLectureTypeTabSelect(event: TabDirective) {
    this.lectureForm.patchValue({
      type: event.heading
    });
    // console.log(this.lectureForm.value);
  }

  onIncludeResourcesChange(event) {
    this.onSubmit(true); // autosave
  }

  onPreviewChange(event) {
    this.onSubmit(true); // autosave
  }

  onLibraryItemSelectVideo(event: CoachingCourseVideo) {
    // TODO check file is a video!
    // console.log('Video selected from library:', event);
    this.lectureForm.patchValue({
      video: event
    });
    this.videoSources = []; // reset
    this.videoSources.push({ // use the array method for reloading a videoGular video as simple [src] binding does not reload on the fly
      src: event.downloadURL
    });
  }

  onLibraryItemSelectResource(event: CoachingCourseResource) {
    // console.log('Resource selected from library:', event);

    const resArray = this.lectureF.resources.value;

    if (!resArray) { // no resources. init new array with selected element
      this.lectureForm.patchValue({ resources: [event] });
      this.onSubmit(true); // autosave
      return;
    }

    resArray.push(event); // add the selected element to the resources array
    this.lectureForm.patchValue({ resources: resArray });
    this.onSubmit(true); // autosave
  }

  removeResource(index: number) {
    const resArray = this.lectureF.resources.value as any[];
    resArray.splice(index, 1);
    this.lectureForm.patchValue({ resources: JSON.parse(JSON.stringify(resArray))});
  }

  async onSubmit(silenceSuccessAlert?: boolean) {
    this.saveAttempt = true;
    this.saving = true;

    // If this is a new lecture
    if (this.isNewLecture && !this.lectureF.id.value) {
      const lectureId = Math.random().toString(36).substr(2, 9); // generate semi-random id
      this.lectureForm.patchValue({ id: lectureId }); // update form with new id
    }

    // Safety checks
    if (this.lectureForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Please complete all fields to continue.');
      this.saving = false;
      return;
    }
    if (!this.course) {
      this.alertService.alert('warning-message', 'Oops', 'Missing eCourse data. Please contact support.');
      this.saving = false;
      return;
    }
    if (!this.activatedSectionId) {
      this.alertService.alert('warning-message', 'Oops', 'No section to associate lecture with. Please contact support.');
      this.saving = false;
      return;
    }

    // Ensure lectures array exists
    if (!this.course.lectures) {
      this.course.lectures = [] as CoachingCourseLecture[];
    }

    // If we're creating a new lecture
    if (this.isNewLecture) {
      // add the lecture into the course object
      this.course.lectures.push(this.lectureForm.value);
      // and associate it's lecture id with the appropriate section by adding it's id to the section lectures array
      const i = this.course.sections.findIndex(item => item.id === this.activatedSectionId);
      if (i !== -1) {
        if (!this.course.sections[i].lectures) {
          this.course.sections[i].lectures = [];
        }
        this.course.sections[i].lectures.push(this.lectureF.id.value);
      }
      this.analyticsService.createCourseLecture(this.lectureForm.value);
    }

    // If we're editing an existing lecture
    if (this.activatedLectureId) {
      const i = this.course.lectures.findIndex(item => item.id === this.activatedLectureId);
      if (i !== -1) {
        this.course.lectures[i] = this.lectureForm.value;
      }
      this.analyticsService.editCourseLecture();
    }

    // Save the course object
    const saveCourse = JSON.parse(JSON.stringify(this.course)); // clone to avoid var reference issues
    await this.dataService.savePrivateCourse(this.course.sellerUid, saveCourse);

    this.saving = false;
    this.saveAttempt = false;

    if (!silenceSuccessAlert) {
      this.alertService.alert('auto-close', 'Success!', 'Your lecture has been saved successfully!');
    }

    // Navigate to relevant section url
    this.router.navigate(['my-courses', this.course.courseId, 'content', 'section', this.activatedSectionId, 'lecture', this.lectureF.id.value], { queryParams: { targetUser: this.userId }});
  }

}
