import { Component, OnInit, Input } from '@angular/core';

/*
  This component loads course results into the view.
*/

@Component({
  selector: 'app-course-results',
  templateUrl: './course-results.component.html',
  styleUrls: ['./course-results.component.scss']
})
export class CourseResultsComponent implements OnInit {

  @Input() results: any;
  @Input() clientCurrency: string;
  @Input() clientCountry: string;
  @Input() rates: any;

  constructor() { }

  ngOnInit() {
  }

}
