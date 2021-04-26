import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';
import { CrmPeopleService } from 'app/services/crm-people.service';

@Component({
  selector: 'app-coach-people',
  templateUrl: 'coach.people.component.html',
  styleUrls: ['./coach.people.component.scss']
})
export class CoachPeopleComponent implements OnInit, OnDestroy {

  public browser: boolean;
  private userId: string;
  public people = [] as CRMPerson[];
  public roomSubscriptions = {} as any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private crmPeopleService: CrmPeopleService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.getUserData();
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          this.loadPeople();
        }
      })
    );
  }

  async loadPeople() {
    this.subscriptions.add(
      this.crmPeopleService.getUserPeople(this.userId).subscribe(async people => {
        if (people) {
          console.log('people:', people);
          this.people = await this.crmPeopleService.getFilledPeople(this.userId, people);
          console.log('filled people:', this.people);
        }
      })
    );
  }

  openMessage(roomId: string) {
    this.router.navigate(['/messages', 'rooms', roomId]);
  }

  openHistory(person: any) {
    this.router.navigate(['/person-history', person.id]);
  }

  archivePerson(person: any) {
    alert('Coming soon!');
  }

  truncate = (input: string, max: number) => input.length > max ? `${input.substring(0, max)}...` : input;

  addPerson() {
    alert('Coming soon!');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
