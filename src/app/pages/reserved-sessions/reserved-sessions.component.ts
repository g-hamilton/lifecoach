import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-reserved-sessions',
  templateUrl: './reserved-sessions.component.html',
  styleUrls: ['./reserved-sessions.component.scss']
})
export class ReservedSessionsComponent implements OnInit, OnDestroy {

  orderedSessions: any;
  user: any;
  onLoad = true;
  uid: string;
  public reservedEvents: Array<any> = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {

    console.log('Initialized');

    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.uid = user.uid;
          console.log('ID is ', this.uid);

          this.subscriptions.add(
            this.dataService.getUserReservedEvents(this.uid).subscribe(next => {
              console.log(next);
              if (next) {
                this.reservedEvents = next;
                console.log(next);
              } else {
                this.reservedEvents = [];
              }
            })
          );

          this.dataService.getTestDocFromReference(this.uid)
            .then(e => console.log(e))
            .catch(e => console.log(e));

        }
      })
    );

  }

  buyEvent(event: any) {
    console.log('You tried to buy event with id: ', new Date(event.timeOfReserve));
    console.log(event.timeOfReserve);
    this.dataService.orderSession(event.coachId, event.calendarId, event.timeOfReserve, this.uid)
      .then(r => {
      })
      .catch(e => console.log(e));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
