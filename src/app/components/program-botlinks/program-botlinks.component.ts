import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-program-botlinks',
  templateUrl: './program-botlinks.component.html',
  styleUrls: ['./program-botlinks.component.scss']
})
export class ProgramBotlinksComponent implements OnInit {

  @Input() filters: any;
  @Input() categories: any;

  constructor() { }

  ngOnInit() {
  }

}
