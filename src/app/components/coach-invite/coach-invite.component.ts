import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-coach-invite',
  templateUrl: './coach-invite.component.html',
  styleUrls: ['./coach-invite.component.scss']
})
export class CoachInviteComponent implements OnInit {

  public title: string;
  public closeBtnName: string;
  public type: 'ecourse' | 'program';

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
  }

}
