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
import { Component, Input } from '@angular/core';
import { SearchService } from 'app/services/search.service';
let CourseBrowseReviewsComponent = class CourseBrowseReviewsComponent {
    constructor(searchService) {
        this.searchService = searchService;
        this.hitsPerPage = 6;
        this.page = 1;
        this.maxSize = 6;
    }
    ngOnInit() {
        if (this.course) {
            this.loadReviews(this.page);
        }
    }
    loadReviews(page) {
        return __awaiter(this, void 0, void 0, function* () {
            // only include reviews for this course that include a text summary
            const filters = { query: null, facets: { courseId: this.course.courseId, summaryExists: true } };
            const res = yield this.searchService.searchCourseReviews(this.hitsPerPage, page, filters);
            this.totalHits = res.nbHits;
            this.hits = res.hits;
        });
    }
    receivePageUpdate(event) {
        // Page has been changed by the navigator component
        console.log('Browse component received new page request:', event);
        this.page = event;
        this.loadReviews(this.page);
    }
    getDisplayDate(unix) {
        const date = new Date(unix * 1000);
        return date.toLocaleDateString();
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CourseBrowseReviewsComponent.prototype, "course", void 0);
CourseBrowseReviewsComponent = __decorate([
    Component({
        selector: 'app-course-browse-reviews',
        templateUrl: './course-browse-reviews.component.html',
        styleUrls: ['./course-browse-reviews.component.scss']
    }),
    __metadata("design:paramtypes", [SearchService])
], CourseBrowseReviewsComponent);
export { CourseBrowseReviewsComponent };
//# sourceMappingURL=course-browse-reviews.component.js.map