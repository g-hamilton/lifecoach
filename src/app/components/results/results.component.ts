import { Component, OnInit, Input } from '@angular/core';

/*
  This component loads coach results into the view.
*/

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  @Input() results: any;

  constructor() { }

  ngOnInit() {
  }

}
