import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-program-results',
  templateUrl: './program-results.component.html',
  styleUrls: ['./program-results.component.scss']
})
export class ProgramResultsComponent implements OnInit {

  @Input() results: any;
  @Input() clientCurrency: string;
  @Input() clientCountry: string;
  @Input() rates: any;

  constructor() { }

  ngOnInit() {
  }

}
