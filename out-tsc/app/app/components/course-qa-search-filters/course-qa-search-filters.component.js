var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Output, EventEmitter } from '@angular/core';
let CourseQaSearchFiltersComponent = class CourseQaSearchFiltersComponent {
    constructor() {
        this.searchEvent = new EventEmitter();
    }
    ngOnInit() {
    }
    searchQuestions() {
        this.searchEvent.emit(this.searchTerm);
    }
};
__decorate([
    Output(),
    __metadata("design:type", Object)
], CourseQaSearchFiltersComponent.prototype, "searchEvent", void 0);
CourseQaSearchFiltersComponent = __decorate([
    Component({
        selector: 'app-course-qa-search-filters',
        templateUrl: './course-qa-search-filters.component.html',
        styleUrls: ['./course-qa-search-filters.component.scss']
    }),
    __metadata("design:paramtypes", [])
], CourseQaSearchFiltersComponent);
export { CourseQaSearchFiltersComponent };
//# sourceMappingURL=course-qa-search-filters.component.js.map