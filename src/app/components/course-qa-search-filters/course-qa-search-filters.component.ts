import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-course-qa-search-filters',
  templateUrl: './course-qa-search-filters.component.html',
  styleUrls: ['./course-qa-search-filters.component.scss']
})
export class CourseQaSearchFiltersComponent implements OnInit {

  @Output() searchEvent = new EventEmitter<string>();

  public searchTerm: string;

  public focus: boolean;
  public focusTouched: boolean;

  constructor() { }

  ngOnInit() {
  }

  searchQuestions() {
    this.searchEvent.emit(this.searchTerm);
  }

}
