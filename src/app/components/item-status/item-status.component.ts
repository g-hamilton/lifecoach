import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-status',
  templateUrl: './item-status.component.html',
  styleUrls: ['./item-status.component.scss']
})
export class ItemStatusComponent implements OnInit {

  @Input() public reviewRequest: any;

  constructor() { }

  ngOnInit() {
  }

}
