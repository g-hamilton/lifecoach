import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AdminServiceReviewRequest } from 'app/interfaces/admin.service.review.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-service-review',
  templateUrl: './admin-service-review.component.html',
  styleUrls: ['./admin-service-review.component.scss']
})
export class AdminServiceReviewComponent implements OnInit, OnDestroy {

  public browser: boolean;

  public totalItems: number;
  public page: number;
  public itemsPerPage: number;
  public maxSize: number;
  public results: AdminServiceReviewRequest[];
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.page = 1;
      this.itemsPerPage = 10;
      this.maxSize = 10;
      this.monitorReviewRequests();
      this.getInitialAdminServicesInReview();
    }
  }

  timestampToDate(timestamp: number) {
    // Convert unix timestamp (epoch) to date string
    return new Date(timestamp * 1000).toDateString();
  }

  monitorReviewRequests() {
    // get the total number of services in review for pagination
    this.subscriptions.add(
      this.dataService.getTotalAdminServicesInReview().subscribe(total => {
        if (total) {
          this.totalItems = total.totalRecords;
        }
      })
    );
  }

  getInitialAdminServicesInReview() {
    const tempSub = this.dataService.getInitialAdminServicesInReview(this.itemsPerPage).subscribe(data => {
      if (data) {
        // console.log('Services in review initial results:', data);
        this.results = data;
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
    });
    this.subscriptions.add(tempSub);
  }

  loadNextResults() {
    const lastDoc = this.results[this.results.length - 1];
    const tempSub = this.dataService.getNextAdminServicesInReview(this.itemsPerPage, lastDoc).subscribe(data => {
      // console.log('Services in review next results:', data);
      if (data.length) {
        this.results = data;
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
    });
    this.subscriptions.add(tempSub);
  }

  loadPreviousResults() {
    const firstDoc = this.results[0];
    const tempSub = this.dataService.getPreviousAdminServicesInReview(this.itemsPerPage, firstDoc).subscribe(data => {
      this.results = data;
      if (data.length) {
        // console.log('Services in review previous results:', data);
      }
      tempSub.unsubscribe(); // close the subscription so every new request doesn't reset the results in view
    });
    this.subscriptions.add(tempSub);
  }

  pageChanged(event: any) {
    // console.log(event.page);
    const requestedPage = event.page;
    if (requestedPage > this.page) { // we're going forwards
      this.loadNextResults();
      this.page = requestedPage;
    } else if (requestedPage < this.page) { // we're going backwards
      this.loadPreviousResults();
      this.page = requestedPage;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
