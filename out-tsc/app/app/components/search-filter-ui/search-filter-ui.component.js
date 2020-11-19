var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from 'app/services/search.service';
let SearchFilterUiComponent = class SearchFilterUiComponent {
    constructor(route, router, searchService) {
        this.route = route;
        this.router = router;
        this.searchService = searchService;
        this.messageEventCountries = new EventEmitter();
        this.messageEventCities = new EventEmitter();
        this.coachCountries = [];
        this.selectedCountries = [];
        this.coachCities = [];
        this.selectedCities = [];
        this.specialitiesList = [
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
        this.selectedSpecialities = [];
    }
    ngOnInit() {
        // Check activated route query params
        this.route.queryParamMap.subscribe(params => {
            if (params) {
                this.filters = Object.assign(Object.assign({}, params.keys), params);
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
    loadCoachCountries(category) {
        return __awaiter(this, void 0, void 0, function* () {
            this.coachCountries = [];
            const res = yield this.searchService.searchCoachCountries(category);
            // console.log(res);
            const hits = res[0].facetHits;
            hits.forEach(hit => {
                this.coachCountries.push({
                    itemName: hit.value,
                    itemCount: hit.count
                });
            });
            this.messageEventCountries.emit(this.coachCountries);
        });
    }
    loadCoachCities(category, countryName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.coachCities = [];
            const res = yield this.searchService.searchCoachCities(category, countryName, query);
            // console.log(res);
            const hits = res[0].facetHits;
            hits.forEach(hit => {
                this.coachCities.push({
                    itemName: hit.value,
                    itemCount: hit.count
                });
            });
            this.messageEventCities.emit(this.coachCities);
        });
    }
    onSpecialitySelect(event) {
        const newParams = { category: event.itemName };
        this.router.navigate(['/coaches'], { queryParams: newParams });
    }
    onCountrySelect(event) {
        const newParams = Object.assign({}, this.filters.params);
        newParams.country = event.itemName;
        if (newParams.city) {
            delete newParams.city;
            this.selectedCities = [];
        }
        this.router.navigate(['/coaches'], { queryParams: newParams });
    }
    onCitySelect(event) {
        const newParams = Object.assign({}, this.filters.params);
        newParams.city = event.itemName;
        this.router.navigate(['/coaches'], { queryParams: newParams });
    }
};
__decorate([
    Output(),
    __metadata("design:type", Object)
], SearchFilterUiComponent.prototype, "messageEventCountries", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], SearchFilterUiComponent.prototype, "messageEventCities", void 0);
SearchFilterUiComponent = __decorate([
    Component({
        selector: 'app-search-filter-ui',
        templateUrl: './search-filter-ui.component.html',
        styleUrls: ['./search-filter-ui.component.scss']
    }),
    __metadata("design:paramtypes", [ActivatedRoute,
        Router,
        SearchService])
], SearchFilterUiComponent);
export { SearchFilterUiComponent };
//# sourceMappingURL=search-filter-ui.component.js.map