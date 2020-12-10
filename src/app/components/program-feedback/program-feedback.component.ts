import { Component, OnInit, Input } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-feedback',
  templateUrl: './program-feedback.component.html',
  styleUrls: ['./program-feedback.component.scss']
})
export class ProgramFeedbackComponent implements OnInit {

  @Input() program: CoachingProgram;

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

    this.program.totalFiveStarReviews ? ratings.push(this.program.totalFiveStarReviews) : ratings.push(0);
    this.program.totalFourPointFiveStarReviews ? ratings.push(this.program.totalFourPointFiveStarReviews) : ratings.push(0);
    this.program.totalFourStarReviews ? ratings.push(this.program.totalFourStarReviews) : ratings.push(0);
    this.program.totalThreePointFiveStarReviews ? ratings.push(this.program.totalThreePointFiveStarReviews) : ratings.push(0);
    this.program.totalThreeStarReviews ? ratings.push(this.program.totalThreeStarReviews) : ratings.push(0);
    this.program.totalTwoPointFiveStarReviews ? ratings.push(this.program.totalTwoPointFiveStarReviews) : ratings.push(0);
    this.program.totalTwoStarReviews ? ratings.push(this.program.totalTwoStarReviews) : ratings.push(0);
    this.program.totalOnePointFiveStarReviews ? ratings.push(this.program.totalOnePointFiveStarReviews) : ratings.push(0);
    this.program.totalOneStarReviews ? ratings.push(this.program.totalOneStarReviews) : ratings.push(0);
    this.program.totalZeroPointFiveStarReviews ? ratings.push(this.program.totalZeroPointFiveStarReviews) : ratings.push(0);

    this.totalReviews = ratings.length ? ratings.reduce((total, val) => total + val) : 0;
    const points = [ratings[0] * 5, ratings[1] * 4.5, ratings[2] * 4, ratings[3] * 3.5, ratings[4] * 3, ratings[5] * 2.5, ratings[6] * 2, ratings[7] * 1.5, ratings[8], ratings[9] * .5 ];
    this.avgRating = points.reduce((total, val) => total + val) / this.totalReviews;
    if (isNaN(this.avgRating)) { // catch not a number
      this.avgRating = 0;
    }

    // cleanup
    if (!this.program.totalFiveStarReviews) {
      this.program.totalFiveStarReviews = 0;
    }
    if (!this.program.totalFourPointFiveStarReviews) {
      this.program.totalFourPointFiveStarReviews = 0;
    }
    if (!this.program.totalFourStarReviews) {
      this.program.totalFourStarReviews = 0;
    }
    if (!this.program.totalThreePointFiveStarReviews) {
      this.program.totalThreePointFiveStarReviews = 0;
    }
    if (!this.program.totalThreeStarReviews) {
      this.program.totalThreeStarReviews = 0;
    }
    if (!this.program.totalTwoPointFiveStarReviews) {
      this.program.totalTwoPointFiveStarReviews = 0;
    }
    if (!this.program.totalTwoStarReviews) {
      this.program.totalTwoStarReviews = 0;
    }
    if (!this.program.totalOnePointFiveStarReviews) {
      this.program.totalOnePointFiveStarReviews = 0;
    }
    if (!this.program.totalOneStarReviews) {
      this.program.totalOneStarReviews = 0;
    }
    if (!this.program.totalZeroPointFiveStarReviews) {
      this.program.totalZeroPointFiveStarReviews = 0;
    }

    // calc % of total reviews for each star rating (not .5s)
    this.pc5 = (this.program.totalFiveStarReviews / this.totalReviews) * 100;
    this.pc4 = ((this.program.totalFourStarReviews + this.program.totalFourPointFiveStarReviews) / this.totalReviews) * 100;
    this.pc3 = ((this.program.totalThreeStarReviews + this.program.totalThreePointFiveStarReviews) / this.totalReviews) * 100;
    this.pc2 = ((this.program.totalTwoStarReviews + this.program.totalTwoPointFiveStarReviews) / this.totalReviews) * 100;
    this.pc1 = ((this.program.totalZeroPointFiveStarReviews + this.program.totalOneStarReviews + this.program.totalOnePointFiveStarReviews) / this.totalReviews) * 100;
  }

}
