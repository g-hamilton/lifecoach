import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-botlinks',
  templateUrl: './botlinks.component.html',
  styleUrls: ['./botlinks.component.scss']
})
export class BotlinksComponent implements OnInit {

  @Input() filters: any;
  @Input() countries: any;
  @Input() cities: any;

  constructor() { }

  ngOnInit() {
  }

}
