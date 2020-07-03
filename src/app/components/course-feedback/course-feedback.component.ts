import { Component, OnInit, Input } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';

@Component({
  selector: 'app-course-feedback',
  templateUrl: './course-feedback.component.html',
  styleUrls: ['./course-feedback.component.scss']
})
export class CourseFeedbackComponent implements OnInit {

  @Input() course: CoachingCourse;

  public totalReviews: number;
  public avgRating: number;
  public pc5: number; // percentage 5* ratings
  public pc4: number; // percentage 4* ratings
  public pc3: number; // percentage 3* ratings
  public pc2: number; // percentage 2* ratings
  public pc1: number; // percentage 1* ratings

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
    const points = [ratings[0] * 5, ratings[1] * 4.5, ratings[2] * 4, ratings[3] * 3.5, ratings[4] * 3, ratings[5] * 2.5, ratings[6] * 2, ratings[7] * 1.5, ratings[8], ratings[9] * .5 ];
    this.avgRating = points.reduce((total, val) => total + val) / this.totalReviews;
    if (isNaN(this.avgRating)) { // catch not a number
      this.avgRating = 0;
    }

    // cleanup
    if (!this.course.totalFiveStarReviews) {
      this.course.totalFiveStarReviews = 0;
    }
    if (!this.course.totalFourPointFiveStarReviews) {
      this.course.totalFourPointFiveStarReviews = 0;
    }
    if (!this.course.totalFourStarReviews) {
      this.course.totalFourStarReviews = 0;
    }
    if (!this.course.totalThreePointFiveStarReviews) {
      this.course.totalThreePointFiveStarReviews = 0;
    }
    if (!this.course.totalThreeStarReviews) {
      this.course.totalThreeStarReviews = 0;
    }
    if (!this.course.totalTwoPointFiveStarReviews) {
      this.course.totalTwoPointFiveStarReviews = 0;
    }
    if (!this.course.totalTwoStarReviews) {
      this.course.totalTwoStarReviews = 0;
    }
    if (!this.course.totalOnePointFiveStarReviews) {
      this.course.totalOnePointFiveStarReviews = 0;
    }
    if (!this.course.totalOneStarReviews) {
      this.course.totalOneStarReviews = 0;
    }
    if (!this.course.totalZeroPointFiveStarReviews) {
      this.course.totalZeroPointFiveStarReviews = 0;
    }

    // calc % of total reviews for each star rating (not .5s)
    this.pc5 = (this.course.totalFiveStarReviews / this.totalReviews) * 100;
    this.pc4 = ((this.course.totalFourStarReviews + this.course.totalFourPointFiveStarReviews) / this.totalReviews) * 100;
    this.pc3 = ((this.course.totalThreeStarReviews + this.course.totalThreePointFiveStarReviews) / this.totalReviews) * 100;
    this.pc2 = ((this.course.totalTwoStarReviews + this.course.totalTwoPointFiveStarReviews) / this.totalReviews) * 100;
    this.pc1 = ((this.course.totalZeroPointFiveStarReviews + this.course.totalOneStarReviews + this.course.totalOnePointFiveStarReviews) / this.totalReviews) * 100;
  }

}
