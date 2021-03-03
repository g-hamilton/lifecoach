import { Component, OnInit, Input } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-preview-card',
  templateUrl: './program-preview-card.component.html',
  styleUrls: ['./program-preview-card.component.scss']
})
export class ProgramPreviewCardComponent implements OnInit {

  @Input() public program: CoachingProgram;

  constructor() { }

  ngOnInit() {
  }

}
