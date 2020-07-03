import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'app/services/data.service';
import { AlertService } from 'app/services/alert.service';
import { CoachingCourseVideo, CoachingCourseResource } from 'app/interfaces/course.interface';

/*
  Note: Using the NGB-Bootstrap Pagination component in the UI to handle pagination.
  https://valor-software.com/ngx-bootstrap/#/pagination

  This component is called 'Course Video Library' but it has expanded to cover
  multiple file types (not just videos)!
*/

@Component({
  selector: 'app-course-video-library',
  templateUrl: './course-video-library.component.html',
  styleUrls: ['./course-video-library.component.scss']
})
export class CourseVideoLibraryComponent implements OnInit {

  @Input() userId: string;
  @Input() selectedItems: CoachingCourseVideo[] | CoachingCourseResource[];

  @Output() messageEvent = new EventEmitter<any>();

  public page: number;
  public totalItems: number;
  public itemsPerPage: number;
  public maxSize: number;
  public results: any[];

  constructor(
    private dataService: DataService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    console.log('Selected items:', this.selectedItems);
    this.page = 1;
    this.itemsPerPage = 10;
    this.maxSize = 6;
    this.getTotalItems();
    this.loadInitialResults();
  }

  getTotalItems() {
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch library total items.');
      return;
    }
    this.dataService.getUserCourseLibraryTotals(this.userId).subscribe(lib => {
      if (lib && lib.totalItems) {
        this.totalItems = lib.totalItems;
      }
    });
  }

  loadInitialResults() {
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch library initial results.');
      return;
    }
    this.dataService.getInitialCourseLibraryItems(this.userId, this.itemsPerPage).subscribe(items => {
      console.log('Initial library results:', items);
      if (items.length) {
        this.results = items;
      }
    });
  }

  loadNextResults() {
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch next library results.');
      return;
    }
    const lastDoc = this.results[this.results.length - 1];
    this.dataService.getNextCourseLibraryItems(this.userId, this.itemsPerPage, lastDoc).subscribe(items => {
      console.log('Next library results:', items);
      if (items.length) {
        this.results = items;
      }
    });
  }

  loadPreviousResults() {
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Error: No user ID. Cannot fetch previous library results.');
      return;
    }
    const firstDoc = this.results[0];
    this.dataService.getPreviousCourseLibraryItems(this.userId, this.itemsPerPage, firstDoc).subscribe(items => {
      console.log('Previous library results:', items);
      if (items.length) {
        this.results = items;
      }
    });
  }

  pageChanged(event: any) {
    console.log(event.page);
    const requestedPage = event.page;
    if (requestedPage > this.page) { // we're going forwards
      this.loadNextResults();
      this.page = requestedPage;
    } else if (requestedPage < this.page) { // we're going backwards
      this.loadPreviousResults();
      this.page = requestedPage;
    }
  }

  onLibraryItemSelect(index: number) {
    this.messageEvent.emit(this.results[index]);
    if (!this.selectedItems) {
      this.selectedItems = [];
    }
    this.selectedItems.push(this.results[index]);
  }

  isAlreadySelected(index: number) {
    let selected = false;
    if (!this.selectedItems) {
      return selected;
    }
    this.selectedItems.forEach(i => {
      if (this.results[index].fileName === i.fileName) {
        selected = true;
      }
    });
    return selected;
  }

}
