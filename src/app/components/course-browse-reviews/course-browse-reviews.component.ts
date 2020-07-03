import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'app/services/search.service';
import { CourseReview } from 'app/interfaces/course-review';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-browse-reviews',
  templateUrl: './course-browse-reviews.component.html',
  styleUrls: ['./course-browse-reviews.component.scss']
})
export class CourseBrowseReviewsComponent implements OnInit {

  @Input() course: CoachingCourse;

  public hitsPerPage = 6;
  public page = 1;
  public maxSize = 6;
  public hits: CourseReview[];
  public totalHits: number;

  constructor(
    private searchService: SearchService
  ) { }

  ngOnInit() {
    if (this.course) {
      this.loadReviews(this.page);
    }
  }

  async loadReviews(page: number) {
    // only include reviews for this course that include a text summary
    const filters = { query: null, facets: { courseId: this.course.courseId, summaryExists: true } };
    const res = await this.searchService.searchCourseReviews(this.hitsPerPage, page, filters);
    this.totalHits = res.nbHits;
    this.hits = res.hits;
  }

  receivePageUpdate(event: number) {
    // Page has been changed by the navigator component
    console.log('Browse component received new page request:', event);
    this.page = event;
    this.loadReviews(this.page);
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toLocaleDateString();
  }

}
