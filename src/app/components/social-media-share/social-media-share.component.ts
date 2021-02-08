import {Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformBrowser, Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {Meta} from '@angular/platform-browser';
import {CoachingCourse} from '../../interfaces/course.interface';
import {CoachingProgram} from '../../interfaces/coach.program.interface';

@Component({
  selector: 'app-social-media-share',
  templateUrl: './social-media-share.component.html',
  styleUrls: ['./social-media-share.component.scss']
})
export class SocialMediaShareComponent implements OnInit {
  public browser: boolean;
  @Input() id: string;
    @Input() public sharingType: 'profile' | 'program' | 'course';
    @Input() public sharingObject: CoachingCourse | CoachingProgram | any;
  @ViewChild('shareModal', {static: false}) public shareModal: ModalDirective;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta
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
    console.log('THIS SHARING TYPE', this.sharingType);
    if (this.sharingType === 'course') {
      console.log(this.sharingObject);
      this.metaTagService.updateTag({name: 'description', content: `${this.sharingObject.subtitle} | Discover leading online coaching courses from Lifecoach.io`}, `name='description'`);
      this.metaTagService.updateTag({
        property: 'og:title', content: `${this.sharingObject.title}`
      }, `property='og:title'`);
      this.metaTagService.updateTag({
        property: 'og:description', content: `${this.sharingObject.subtitle}`
      }, `property='og:description'`);
      this.metaTagService.updateTag({
        property: 'og:image:url', content: this.sharingObject.image ? this.sharingObject.image : this.sharingObject.coachPhoto
      }, `property='og:image:url'`);
      const url = this.router.createUrlTree([],
          {
            relativeTo: this.activatedRoute,
            queryParams: { referralCode: this.id ? this.id : '' }
          }).toString();

      this.location.go(`${this.router.url.toString()
          .replace('my-course', 'course')
          .replace('/content', '')}?referralCode=${this.id ? this.id : ''}`);
    }
    if (this.sharingType === 'profile') {
      console.log(this.sharingObject);
      this.metaTagService.updateTag({name: 'description', content: `${this.sharingObject.firstName} ${this.sharingObject.firstName}`}, `name='description'`);
      this.metaTagService.updateTag({
        property: 'og:title', content: `${this.sharingObject.city}`
      }, `property='og:title'`);
      this.metaTagService.updateTag({
        property: 'og:description', content: `${this.sharingObject.proSummary}`
      }, `property='og:description'`);
      this.metaTagService.updateTag({
        property: 'og:image:url', content: this.sharingObject.photo ? this.sharingObject.photo : this.sharingObject.coachPhoto
      }, `property='og:image:url'`);
      const url = this.router.createUrlTree([],
          {
            relativeTo: this.activatedRoute,
            queryParams: { referralCode: this.id ? this.id : '' }
          }).toString();

      this.location.go(`${this.router.url.toString()
          .replace('profile', `coach/${this.id}`)}?referralCode=${this.id ? this.id : ''}`);
    }
    if (this.sharingType === 'program') {
      console.log(this.sharingObject);
      this.metaTagService.updateTag({name: 'description', content: `${this.sharingObject.subtitle} | Discover leading online coaching courses from Lifecoach.io`}, `name='description'`);
      this.metaTagService.updateTag({
        property: 'og:title', content: `${this.sharingObject.title}`
      }, `property='og:title'`);
      this.metaTagService.updateTag({
        property: 'og:description', content: `${this.sharingObject.subtitle}`
      }, `property='og:description'`);
      this.metaTagService.updateTag({
        property: 'og:image:url', content: this.sharingObject.image ? this.sharingObject.image : this.sharingObject.coachPhoto
      }, `property='og:image:url'`);
      const url = this.router.createUrlTree([],
          {
            relativeTo: this.activatedRoute,
            queryParams: { referralCode: this.id ? this.id : '' }
          }).toString();

      this.location.go(`${this.router.url.toString()
          .replace('my-programs', 'program')
          .replace('/content', '')}?referralCode=${this.id ? this.id : ''}`);
    }
  }
  fixLink() {
    this.location.go(`${this.router.url}`);
  }

}
