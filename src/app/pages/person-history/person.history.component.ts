import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
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
      this.dataService.getUserPerson(this.userId, this.personId).subscribe(async p => {
        if (p) {
          // console.log('base person:', p);

          const person = await this.getPersonData(this.personId) as CRMPerson;
          if (person) {
            person.id = this.personId;
            person.created = new Date(p.created * 1000); // convert from unix to Date
            person.lastReplyReceived = p.lastReplyReceived ? p.lastReplyReceived : null;
            const history = await this.getPersonHistory(this.userId, this.personId);
            if (history) {
              person.history = history;
            }
            person.type = await this.getPersonType(person) as any;
            person.status = await this.getPersonStatus(person) as any;
          }

          this.person = person;
          console.log('filled person:', this.person);
        }
      })
    );
  }

  async getPersonData(uid: string) {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.dataService.getRegularProfile(uid).subscribe(profile => {
          if (profile) {
            const person = {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              photo: profile.photo ? profile.photo : `https://eu.ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` // https://eu.ui-avatars.com/
            } as CRMPerson;
            resolve(person);
          } else {
            resolve(null);
          }
        })
      );
    });
  }

  async getPersonHistory(uid: string, personUid: string) {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.dataService.getUserPersonHistory(uid, personUid).subscribe(history => {
          if (history) {
            resolve(history);
          } else {
            resolve(null);
          }
        })
      );
    });
  }

  getPersonType(person: CRMPerson) {
    return new Promise(resolve => {
      const lastAction = person.history[person.history.length - 1].action;
      let type: 'warm lead' | 'lead' | 'client';
      switch (lastAction) {
        case 'sent_first_message':
          type = this.isPersonWarm(person) ? 'warm lead' : 'lead';
          break;
        case 'enrolled_in_self_study_course':
          type = 'client';
          break;
        default:
          type = 'lead';
      }
      resolve(type);
    });
  }

  isPersonWarm(person: CRMPerson) {
    // check if a lead is warm
    // a warm lead is less than 7 days old
    const personCreatedUnix = Math.round(person.created.getTime() / 1000);
    const nowUnix = Math.round(new Date().getTime() / 1000);
    const warmLimitDays = 7;
    const warmLimit = 60 * 60 * 1000 * 24 * warmLimitDays;

    if (!person.lastReplyReceived && person.created) {
      if (personCreatedUnix > (nowUnix - warmLimit)) {
        return true; // the first lead was received in the last 7 days
      }
    }

    if (Number(person.lastReplyReceived) > (nowUnix - warmLimit)) {
      return true; // the user responded in the last 7 days
    }

    return false;
  }

  getPersonStatus(person: CRMPerson) {
    return new Promise(async resolve => {
      const lastAction = person.history[person.history.length - 1].action;
      let status: string;
      switch (lastAction) {
        case 'sent_first_message':
          status = await this.getMsgStatus(person.history[person.history.length - 1].roomId) as any;
          break;
        case 'enrolled_in_self_study_course':
          status = 'Enrolled in self-study course';
          break;
        default:
          status = 'Message';
      }
      resolve(status);
    });
  }

  getMsgStatus(roomId: string) {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.dataService.getRoomFeed(roomId).subscribe(feed => {
          const lastMsg = feed[feed.length - 1];
          if (feed.length === 1) {
            resolve('Awaiting reply');
          } else if (lastMsg.from === this.userId) {
            resolve('Responded');
          } else {
            resolve('Client responded');
          }
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
