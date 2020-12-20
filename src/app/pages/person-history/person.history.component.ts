import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';
import { CrmPeopleService } from 'app/services/crm-people.service';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';

@Component({
  selector: 'app-person-history',
  templateUrl: 'person.history.component.html'
})
export class PersonHistoryComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;

  public browser: boolean;
  private userId: string; // the user's own id
  private personId: string; // the id of the person the user is looking at
  public person: CRMPerson;
  private subscriptions: Subscription = new Subscription();
  public msgUrl = '/messages';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private crmPeopleService: CrmPeopleService,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.route.params.subscribe(params => {
        if (params.uid) {
          this.personId = params.uid;
          this.getUserData();
        }
      });
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          this.loadPerson();
        }
      })
    );
  }

  loadPerson() {
    this.subscriptions.add(
      this.crmPeopleService.getUserPerson(this.userId, this.personId).subscribe(async p => {
        if (p) {
          console.log('person:', p);
          this.person = await this.crmPeopleService.getFilledPerson(this.userId, p, this.personId);
          this.updateMsgUrl();
        }
      })
    );
  }

  updateMsgUrl() {
    // checks if this person has a message room. if so, updates the msg url to take
    // the coach to that room on click
    let roomId: string;
    if (this.person.history) {
      this.person.history.forEach(item => {
        if (item.roomId) {
          roomId = item.roomId;
        }
      });
    }
    if (roomId) {
      this.msgUrl = `/messages/rooms/${roomId}`;
    }
  }

  openInviteModal() {
    const config: ModalOptions = {
      initialState: {
        title: 'Woop!',
        closeBtnName: 'Close Up!'
      }
    };
    this.bsModalRef = this.modalService.show(CoachInviteComponent, config);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
