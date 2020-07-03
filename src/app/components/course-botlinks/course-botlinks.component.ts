import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-course-botlinks',
  templateUrl: './course-botlinks.component.html',
  styleUrls: ['./course-botlinks.component.scss']
})
export class CourseBotlinksComponent implements OnInit {

  @Input() filters: any;
  @Input() categories: any;

  constructor() { }

  ngOnInit() {
  }

}
