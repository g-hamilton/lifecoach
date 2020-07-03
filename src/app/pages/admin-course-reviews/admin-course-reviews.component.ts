import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AdminCourseReviewRequest } from 'app/interfaces/admin.course.review';

@Component({
  selector: 'app-admin-course-reviews',
  templateUrl: './admin-course-reviews.component.html',
  styleUrls: ['./admin-course-reviews.component.scss']
})
export class AdminCourseReviewsComponent implements OnInit {

  public browser: boolean;

  public totalItems: number;
  public page: number;
  public itemsPerPage: number;
  public maxSize: number;
  public results: AdminCourseReviewRequest[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cloudFunctionsService: CloudFunctionsService,
    private dataService: DataService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        this.browser = true;
        this.page = 1;
        this.itemsPerPage = 10;
        this.maxSize = 10;
        this.monitorReviewRequests();
        this.getInitialAdminCoursesInReview();
    }
  }

  timestampToDate(timestamp: number) {
      // Convert unix timestamp (epoch) to date string
      return new Date(timestamp * 1000).toDateString();
  }

  monitorReviewRequests() {
    // get the total number of courses in review for pagination
    this.dataService.getTotalAdminCoursesInReview().subscribe(total => {
      if (total) {
        this.totalItems = total.totalRecords;
      }
    });
  }

  getInitialAdminCoursesInReview() {
    const tempSub = this.dataService.getInitialAdminCoursesInReview(this.itemsPerPage).subscribe(data => {
      if (data) {
        console.log('Courses in review initial results:', data);
        this.results = data;
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
    });
  }

  loadNextResults() {
    const lastDoc = this.results[this.results.length - 1];
    const tempSub = this.dataService.getNextAdminCoursesInReview(this.itemsPerPage, lastDoc).subscribe(data => {
      console.log('Courses in review next results:', data);
      if (data.length) {
        this.results = data;
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
    });
  }

  loadPreviousResults() {
    const firstDoc = this.results[0];
    const tempSub = this.dataService.getPreviousAdminCoursesInReview(this.itemsPerPage, firstDoc).subscribe(data => {
      this.results = data;
      if (data.length) {
        console.log('Courses in review previous results:', data);
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
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

}
