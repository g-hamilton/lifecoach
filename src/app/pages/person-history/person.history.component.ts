import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CRMPerson, CRMPersonHistoryEvent } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';
import { CrmPeopleService } from 'app/services/crm-people.service';

@Component({
  selector: 'app-person-history',
  templateUrl: 'person.history.component.html'
})
export class PersonHistoryComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string; // the user's own id
  private personId: string; // the id of the person the user is looking at
  public person: CRMPerson;
  private subscriptions: Subscription = new Subscription();
  public msgUrl = '/messages';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private crmPeopleService: CrmPeopleService,
    private route: ActivatedRoute,
    private router: Router
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
