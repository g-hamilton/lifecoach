import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'app/services/search.service';
import { CourseReview } from 'app/interfaces/course-review';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { ProgramReview } from 'app/interfaces/program-review';

@Component({
  selector: 'app-program-browse-reviews',
  templateUrl: './program-browse-reviews.component.html',
  styleUrls: ['./program-browse-reviews.component.scss']
})
export class ProgramBrowseReviewsComponent implements OnInit {

  @Input() program: CoachingProgram;

  public hitsPerPage = 6;
  public page = 1;
  public maxSize = 6;
  public hits: ProgramReview[];
  public totalHits: number;

  constructor(
    private searchService: SearchService
  ) { }

  ngOnInit() {
    if (this.program) {
      this.loadReviews(this.page);
    }
  }

  async loadReviews(page: number) {
    // only include reviews for this program that include a text summary
    const filters = { query: null, facets: { programId: this.program.programId, summaryExists: true } };
    const res = await this.searchService.searchProgramReviews(this.hitsPerPage, page, filters);
    this.totalHits = res.nbHits;
    this.hits = res.hits;
  }

  receivePageUpdate(event: number) {
    // Page has been changed by the navigator component
    // console.log('Browse component received new page request:', event);
    this.page = event;
    this.loadReviews(this.page);
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    return date.toLocaleDateString();
  }

}
