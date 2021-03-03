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
  @Input() public maxDiscount: any;

  public maxDiscountObj = { max: 0 };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (!this.maxDiscount) {
      this.calcDiscount();
    }
  }

  get formControls(): any {
    return this.formData.controls;
  }

  calcDiscount() {

    if (!this.program || !this.program.pricingStrategy || this.program.pricingStrategy !== 'flexible' ||
    !this.program.fullPrice || !this.program.numSessions || !this.program.pricePerSession) {
      return 0;
    }

    if ((this.program.numSessions * this.program.pricePerSession) <= this.program.fullPrice) {
      return 0;
    }

    const discount = Number((100 - (this.program.fullPrice / (this.program.numSessions * this.program.pricePerSession)) * 100).toFixed());

    // update the max discount if required
    this.maxDiscountObj.max = 0;
    if (discount > this.maxDiscountObj.max) {
      this.maxDiscountObj.max = discount;
    }

    return discount;

  }

}
