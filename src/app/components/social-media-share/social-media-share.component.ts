import {Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformBrowser, Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {ModalDirective} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-social-media-share',
  templateUrl: './social-media-share.component.html',
  styleUrls: ['./social-media-share.component.scss']
})
export class SocialMediaShareComponent implements OnInit {
  public browser: boolean;
  @Input() id: string;
  @ViewChild('shareModal', {static: false}) public shareModal: ModalDirective;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
    }
  }

  share() {
    this.shareModal.show();
  }
  addRefId() {
    const url = this.router.createUrlTree([],
      {
        relativeTo: this.activatedRoute,
        queryParams: {referralCode: 1}
      }).toString();
    this.location.go(url);
  }
  fixLink() {
    this.location.go(`${this.router.url}`);
  }

}
