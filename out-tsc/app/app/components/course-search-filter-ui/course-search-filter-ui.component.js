var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
let CourseSearchFilterUiComponent = class CourseSearchFilterUiComponent {
    constructor(route, router) {
        this.route = route;
        this.router = router;
        this.currencyEvent = new EventEmitter();
        this.selectedCategory = null;
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
            this.selectedCategory = cat;
        }
    }
    onCategorySelect(event) {
        const newParams = { category: event.target.value };
        this.router.navigate(['/courses'], { queryParams: newParams });
    }
    onManualCurrencyChange(event) {
        this.currencyEvent.emit(event);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CourseSearchFilterUiComponent.prototype, "clientCurrency", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseSearchFilterUiComponent.prototype, "categories", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], CourseSearchFilterUiComponent.prototype, "currencyEvent", void 0);
CourseSearchFilterUiComponent = __decorate([
    Component({
        selector: 'app-course-search-filter-ui',
        templateUrl: './course-search-filter-ui.component.html',
        styleUrls: ['./course-search-filter-ui.component.scss']
    }),
    __metadata("design:paramtypes", [ActivatedRoute,
        Router])
], CourseSearchFilterUiComponent);
export { CourseSearchFilterUiComponent };
//# sourceMappingURL=course-search-filter-ui.component.js.map