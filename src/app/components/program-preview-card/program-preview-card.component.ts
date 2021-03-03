import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-preview-card',
  templateUrl: './program-preview-card.component.html',
  styleUrls: ['./program-preview-card.component.scss']
})
export class ProgramPreviewCardComponent implements OnInit, OnChanges {

  @Input() public previewMode: boolean;
  @Input() public program: CoachingProgram;
  @Input() public formData: FormGroup;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    console.log('previewMode:', this.previewMode);
    console.log('formData:', this.formData);
  }

  get formControls(): any {
    return this.formData.controls;
  }

}
