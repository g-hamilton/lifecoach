var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
let StarsComponent = class StarsComponent {
    constructor() { }
    ngOnInit() {
        this.calcRatings();
    }
    calcRatings() {
        const ratings = [];
        this.course.totalFiveStarReviews ? ratings.push(this.course.totalFiveStarReviews) : ratings.push(0);
        this.course.totalFourPointFiveStarReviews ? ratings.push(this.course.totalFourPointFiveStarReviews) : ratings.push(0);
        this.course.totalFourStarReviews ? ratings.push(this.course.totalFourStarReviews) : ratings.push(0);
        this.course.totalThreePointFiveStarReviews ? ratings.push(this.course.totalThreePointFiveStarReviews) : ratings.push(0);
        this.course.totalThreeStarReviews ? ratings.push(this.course.totalThreeStarReviews) : ratings.push(0);
        this.course.totalTwoPointFiveStarReviews ? ratings.push(this.course.totalTwoPointFiveStarReviews) : ratings.push(0);
        this.course.totalTwoStarReviews ? ratings.push(this.course.totalTwoStarReviews) : ratings.push(0);
        this.course.totalOnePointFiveStarReviews ? ratings.push(this.course.totalOnePointFiveStarReviews) : ratings.push(0);
        this.course.totalOneStarReviews ? ratings.push(this.course.totalOneStarReviews) : ratings.push(0);
        this.course.totalZeroPointFiveStarReviews ? ratings.push(this.course.totalZeroPointFiveStarReviews) : ratings.push(0);
        this.totalReviews = ratings.length ? ratings.reduce((total, val) => total + val) : 0;
        const points = [ratings[0] * 5, ratings[1] * 4.5, ratings[2] * 4, ratings[3] * 3.5, ratings[4] * 3, ratings[5] * 2.5, ratings[6] * 2, ratings[7] * 1.5, ratings[8], ratings[9] * .5];
        this.avgRating = points.reduce((total, val) => total + val) / this.totalReviews;
        if (isNaN(this.avgRating)) { // catch not a number
            this.avgRating = 0;
        }
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], StarsComponent.prototype, "course", void 0);
StarsComponent = __decorate([
    Component({
        selector: 'app-stars',
        templateUrl: './stars.component.html',
        styleUrls: ['./stars.component.scss']
    }),
    __metadata("design:paramtypes", [])
], StarsComponent);
export { StarsComponent };
//# sourceMappingURL=stars.component.js.map