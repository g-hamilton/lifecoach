import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CRMPerson, CRMPersonHistoryEvent } from 'app/interfaces/crm.person.interface';
import { DataService } from './data.service';
import { CustomCalendarEvent } from 'app/interfaces/custom.calendar.event.interface';

@Injectable({
  providedIn: 'root'
})
export class CrmPeopleService implements OnDestroy {

  private subscriptions: Subscription = new Subscription();

  constructor(
    private db: AngularFirestore,
    private dataService: DataService,
  ) { }

  getUserPeople(uid: string) {
    return this.db.collection(`users/${uid}/people`)
      .valueChanges({idField: 'id'}) as Observable<CRMPerson[]>;
  }

  getUserPersonHistory(uid: string, personUid: string) {
    return this.db.collection(`users/${uid}/people/${personUid}/history`)
      .valueChanges({idField: 'id'}) as Observable<CRMPersonHistoryEvent[]>;
  }

  getUserPerson(uid: string, personUid: string) {
    return this.db.collection(`users/${uid}/people`)
      .doc(personUid)
      .valueChanges() as Observable<CRMPerson>;
  }

  async getFilledPeople(uid: string, people: CRMPerson[]) {
    if (people) {
      const filledPeople = [] as CRMPerson[];

      for (const p of people) {
        const person = await this.getPersonData(p.id) as CRMPerson;
        if (person) {
          person.id = p.id;
          person.created = new Date((p.created as any) * 1000); // convert from unix to Date
          person.lastReplyReceived = p.lastReplyReceived ? p.lastReplyReceived : null;
          const history = await this.getPersonHistory(uid, p.id);
          if (history) {
            person.history = history;
          }
          person.type = await this.getPersonType(person) as any;
          person.status = await this.getPersonStatus(uid, person) as any;
          filledPeople.push(person);
        }
      }
      return filledPeople;
    }
    return [] as CRMPerson[];
  }

  async getFilledPerson(uid: string, p: CRMPerson, personId: string): Promise<CRMPerson> {
    return new Promise(async resolve => {
      if (personId) {
        const person = await this.getPersonData(personId) as CRMPerson;
        console.log('person:', person);
        if (person) {
          person.id = personId;
          person.created = new Date((p.created as any) * 1000); // convert from unix to Date
          person.lastReplyReceived = p.lastReplyReceived ? p.lastReplyReceived : null;
          const history = await this.getPersonHistory(uid, personId);
          if (history) {
            person.history = history;
          }
          person.type = await this.getPersonType(person) as any;
          person.status = await this.getPersonStatus(uid, person) as any;
        }
        resolve(person);
      }
      resolve(p);
    });
  }

  async getPersonData(uid: string) {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.dataService.getRegularProfile(uid).pipe(take(1)).subscribe(profile => {
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

  async getPersonHistory(uid: string, personUid: string): Promise<CRMPersonHistoryEvent[]> {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.getUserPersonHistory(uid, personUid).pipe(take(1)).subscribe(history => {
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
        case 'enrolled_in_full_program':
          type = 'client';
          break;
        case 'enrolled_in_program_session':
          type = 'client';
          break;
        case 'coach_invited_user':
          type = 'lead';
          break;
        case 'booked_session':
          type = this.isPersonWarm(person) ? 'warm lead' : 'lead';
          break;
        case 'service_purchase':
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
        return true; // the first lead was received within the time limit
      }
    }

    if (Number(person.lastReplyReceived) > (nowUnix - warmLimit)) {
      return true; // the user responded within the time limit
    }

    if (person.history[person.history.length - 1].action === 'booked_session' || person.history[person.history.length - 1].action === 'cancelled_session') {
      const endDateUnix = Math.round(new Date(((person.history[person.history.length - 1].event) as CustomCalendarEvent).end).getTime() / 1000);
      if (endDateUnix > (nowUnix - warmLimit)) {
        return true; // the user booked or cancelled a booked session within the time limit
      }
    }

    return false;
  }

  getPersonStatus(uid, person: CRMPerson) {
    return new Promise(async resolve => {
      const lastAction = (person.history[person.history.length - 1] as CRMPersonHistoryEvent).action;
      let status: string;
      switch (lastAction) {
        case 'sent_first_message':
          status = await this.getMsgStatus(uid, person.history[person.history.length - 1].roomId) as any;
          break;
        case 'enrolled_in_self_study_course':
          status = 'Enrolled in eCourse';
          break;
        case 'enrolled_in_full_program':
          status = 'Enrolled in program';
          break;
        case 'enrolled_in_program_session':
          status = 'Enrolled in program';
          break;
        case 'coach_invited_user':
          status = 'Invited';
          break;
        case 'booked_session':
          status = 'In Discovery';
          break;
        case 'cancelled_session':
          status = 'Cancelled Session';
          break;
        case 'service_purchase':
          status = 'In Coaching';
          break;
        default:
          status = 'Message';
      }
      resolve(status);
    });
  }

  getMsgStatus(uid: string, roomId: string) {
    return new Promise(resolve => {
      this.subscriptions.add(
        this.dataService.getRoomFeed(roomId).subscribe(feed => {
          const lastMsg = feed[feed.length - 1];
          if (feed.length === 1) {
            resolve('Awaiting reply');
          } else if (lastMsg.from === uid) {
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
