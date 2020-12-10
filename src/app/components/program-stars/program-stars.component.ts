import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-stars',
  templateUrl: './program-stars.component.html',
  styleUrls: ['./program-stars.component.scss']
})
export class ProgramStarsComponent implements OnInit {

  @Input() program: CoachingProgram;

  @Output() totalReviewsEvent = new EventEmitter<any>();

  public totalReviews: number;
  public avgRating: number;

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

    this.totalReviewsEvent.emit(this.totalReviews); // emit the data

    const points = [ratings[0] * 5, ratings[1] * 4.5, ratings[2] * 4, ratings[3] * 3.5, ratings[4] * 3, ratings[5] * 2.5, ratings[6] * 2, ratings[7] * 1.5, ratings[8], ratings[9] * .5 ];
    this.avgRating = points.reduce((total, val) => total + val) / this.totalReviews;
    if (isNaN(this.avgRating)) { // catch not a number
      this.avgRating = 0;
    }
  }

}
