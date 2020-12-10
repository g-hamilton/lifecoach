import { Component, OnInit, Input } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-content',
  templateUrl: './program-content.component.html',
  styleUrls: ['./program-content.component.scss']
})
export class ProgramContentComponent implements OnInit {

  @Input() program: CoachingProgram;

  constructor() { }

  ngOnInit() {
  }

}
