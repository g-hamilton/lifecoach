import { Component, Input, OnInit } from '@angular/core';
import { MatChip } from '@angular/material';

@Component({
  selector: 'app-chips-multi-select',
  templateUrl: './chips-multi-select.component.html',
  styleUrls: ['./chips-multi-select.component.scss']
})
export class ChipsMultiSelectComponent implements OnInit {

  @Input() options: string[];

  constructor() { }

  ngOnInit() {
  }

  toggleSelection(chip: MatChip) {
    chip.toggleSelected();
 }

}
