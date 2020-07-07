import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from 'app/services/data.service';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';

@Component({
  selector: 'app-coach-people',
  templateUrl: 'coach.people.component.html',
  styleUrls: ['./coach.people.component.scss']
})
export class CoachPeopleComponent implements OnInit {

  public browser: boolean;
  private userId: string;
  public people = [] as CRMPerson[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUserData();
    }

  }

  getUserData() {
    this.authService.getAuthUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadPeople();
      }
    });
  }

  loadPeople() {
    this.dataService.getUserPeople(this.userId).subscribe(async people => {
      if (people) {
        console.log('people:', people);
        const filledPeople = [];
        for (const p of people) {
          const person = await this.getPersonData(p.id) as any;
          if (person) {
            person.created = new Date(p.created * 1000); // convert from unix to Date
            const history = await this.getPersonHistory(this.userId, p.id);
            if (history) {
              person.history = history;
            }
            filledPeople.push(person);
          }
        }
        this.people = filledPeople;
        console.log('filled people:', this.people);
      }
    });
  }

  async getPersonData(uid: string) {
    return new Promise(resolve => {
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
      });
    });
  }

  async getPersonHistory(uid: string, personUid: string) {
    return new Promise(resolve => {
      this.dataService.getUserPersonHistory(uid, personUid).subscribe(history => {
        if (history) {
          resolve(history);
        } else {
          resolve(null);
        }
      });
    });
  }

  getPersonState(person: any) {
    const lastAction = person.history[person.history.length - 1].action;
    switch (lastAction) {
      case 'sent_first_message':
        return '🔥 New Lead';
    }
  }

  getPersonStatus(person: any) {
    const lastAction = person.history[person.history.length - 1].action;
    switch (lastAction) {
      case 'sent_first_message':
        return 'Awaiting reply';
    }
  }

  openMessageCentre() {
    this.router.navigate(['/messages']);
  }

}
