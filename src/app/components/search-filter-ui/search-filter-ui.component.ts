import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-search-filter-ui',
  templateUrl: './search-filter-ui.component.html',
  styleUrls: ['./search-filter-ui.component.scss']
})
export class SearchFilterUiComponent implements OnInit {

  @Output() messageEventCountries = new EventEmitter<any>();
  @Output() messageEventCities = new EventEmitter<any>();

  public searchTerm: string;
  public filters: any;

  public coachCountries = [];
  public selectedCountries = [];
  public coachCities = [];
  public selectedCities = [];
  public specialitiesList = [
    { itemName: 'Business & Career' },
    { itemName: 'Health, Fitness & Wellness' },
    { itemName: 'Relationship' },
    { itemName: 'Money & Financial' },
    { itemName: 'Family' },
    { itemName: 'Religion & Faith' },
    { itemName: 'Retirement' },
    { itemName: 'Transformation & Mindset' },
    { itemName: 'Relocation' },
    { itemName: 'Academic' },
    { itemName: 'Holistic' },
    { itemName: 'Productivity & Personal Organisation' }
  ];
  public selectedSpecialities = [];

  public focus: boolean;
  public focusTouched: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
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
      this.selectedSpecialities = [];
      this.selectedSpecialities.push({ itemName: cat });
    }
    if (!this.filters.params.country) {
      this.loadCoachCountries(this.filters.params.category);
    }
    if (this.filters.params.q) {
      this.searchTerm = this.filters.params.q;
    }
    if (this.filters.params.q && this.filters.params.country) {
      this.loadCoachCities(null, this.filters.params.country, this.filters.params.q);
      this.selectedCountries = [];
      this.selectedCountries.push({ itemName: this.filters.params.country });
    }
    if (this.filters.params.category && this.filters.params.country) {
      this.loadCoachCountries(this.filters.params.category);
      this.loadCoachCities(this.filters.params.category, this.filters.params.country);
      this.selectedCountries = [];
      this.selectedCountries.push({ itemName: this.filters.params.country });
    }
    if (this.filters.params.category && this.filters.params.country && this.filters.params.city) {
      this.selectedCities = [];
      this.selectedCities.push({ itemName: this.filters.params.city });
    }
  }

  async loadCoachCountries(category: string) {
    this.coachCountries = [];
    const res = await this.searchService.searchCoachCountries(category);
    // console.log(res);
    const hits = res[0].facetHits;
    hits.forEach(hit => {
      this.coachCountries.push({
        itemName: hit.value,
        itemCount: hit.count
      });
    });
    this.messageEventCountries.emit(this.coachCountries);
  }

  async loadCoachCities(category: string, countryName: string, query?: string) {
    this.coachCities = [];
    const res = await this.searchService.searchCoachCities(category, countryName, query);
    // console.log(res);
    const hits = res[0].facetHits;
    hits.forEach(hit => {
      this.coachCities.push({
        itemName: hit.value,
        itemCount: hit.count
      });
    });
    this.messageEventCities.emit(this.coachCities);
  }

  onSpecialitySelect(event: any) {
    const newParams = { category: event.itemName };
    this.router.navigate(['/coaches'], { queryParams: newParams });
  }

  onCountrySelect(event: any) {
    const newParams = Object.assign({}, this.filters.params);
    newParams.country = event.itemName;
    if (newParams.city) {
      delete newParams.city;
      this.selectedCities = [];
    }
    this.router.navigate(['/coaches'], { queryParams: newParams });
  }

  onCitySelect(event: any) {
    const newParams = Object.assign({}, this.filters.params);
    newParams.city = event.itemName;
    this.router.navigate(['/coaches'], { queryParams: newParams });
  }

}
