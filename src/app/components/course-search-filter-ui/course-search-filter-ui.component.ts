import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course-search-filter-ui',
  templateUrl: './course-search-filter-ui.component.html',
  styleUrls: ['./course-search-filter-ui.component.scss']
})
export class CourseSearchFilterUiComponent implements OnInit {

  @Input() clientCurrency: string;
  @Input() categories: any;
  @Output() currencyEvent = new EventEmitter<string>();

  public searchTerm: string;
  public filters: any;

  public selectedCategory = null;

  public focus: boolean;
  public focusTouched: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Check activated route query params
    this.route.queryParamMap.subscribe(params => {
      if (params) {
        this.filters = {...params.keys, ...params};
        // console.log('Navigator filters updated:', this.filters);
        // When route params change, update the UI with relevant data
        this.updateUI();
      }
    });
  }

  updateUI() {
    if (this.filters.params.category) {
      let cat = this.filters.params.category;
      cat = cat.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' '); // convert to title case
      this.selectedCategory = cat;
    }
  }

  onCategorySelect(event: any) {
    const newParams = { category: event.target.value };
    this.router.navigate(['/courses'], { queryParams: newParams });
  }

  onManualCurrencyChange(event) {
    this.currencyEvent.emit(event);
  }

}
